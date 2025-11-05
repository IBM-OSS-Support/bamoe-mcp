'use strict';

var base_cjs = require('../base.cjs');
var retryable_cjs = require('../../../../internals/helpers/retryable.cjs');
var base_cjs$1 = require('../../../base.cjs');
var prompts_cjs = require('../../prompts.cjs');
var base_cjs$2 = require('../../../../tools/base.cjs');
var errors_cjs = require('../../../../errors.cjs');
var remeda = require('remeda');
var linePrefix_cjs = require('../../../../parsers/linePrefix.cjs');
var field_cjs = require('../../../../parsers/field.cjs');
var zod = require('zod');
var message_cjs = require('../../../../backend/message.cjs');
var tokenMemory_cjs = require('../../../../memory/tokenMemory.cjs');
var object_cjs = require('../../../../internals/helpers/object.cjs');
var decoratorCache_cjs = require('../../../../cache/decoratorCache.cjs');
var utils_cjs = require('../../../../serializer/utils.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function _ts_decorate(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate, "_ts_decorate");
function _ts_metadata(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata, "_ts_metadata");
class DefaultRunner extends base_cjs.BaseRunner {
  static {
    __name(this, "DefaultRunner");
  }
  useNativeToolCalling = false;
  get defaultTemplates() {
    return {
      system: prompts_cjs.ReActAgentSystemPrompt,
      assistant: prompts_cjs.ReActAgentAssistantPrompt,
      user: prompts_cjs.ReActAgentUserPrompt,
      schemaError: prompts_cjs.ReActAgentSchemaErrorPrompt,
      toolNotFoundError: prompts_cjs.ReActAgentToolNotFoundPrompt,
      toolError: prompts_cjs.ReActAgentToolErrorPrompt,
      toolInputError: prompts_cjs.ReActAgentToolInputErrorPrompt,
      userEmpty: prompts_cjs.ReActAgentUserEmptyPrompt,
      toolNoResultError: prompts_cjs.ReActAgentToolNoResultsPrompt
    };
  }
  static {
    this.register();
  }
  async llm({ signal, meta, emitter }) {
    const tempMessageKey = "tempMessage";
    return new retryable_cjs.Retryable({
      onRetry: /* @__PURE__ */ __name(() => emitter.emit("retry", {
        meta
      }), "onRetry"),
      onError: /* @__PURE__ */ __name(async (error) => {
        await emitter.emit("error", {
          error,
          meta
        });
        this.failedAttemptsCounter.use(error);
        if (error instanceof linePrefix_cjs.LinePrefixParserError) {
          if (error.reason === linePrefix_cjs.LinePrefixParserError.Reason.NoDataReceived) {
            await this.memory.add(new message_cjs.AssistantMessage("\n", {
              [tempMessageKey]: true
            }));
          } else {
            await this.memory.add(new message_cjs.UserMessage(this.templates.schemaError.render({}), {
              [tempMessageKey]: true
            }));
          }
        }
      }, "onError"),
      executor: /* @__PURE__ */ __name(async () => {
        const tools = this.input.tools.slice();
        await emitter.emit("start", {
          meta,
          tools,
          memory: this.memory
        });
        const { parser } = this.createParser(tools);
        const raw = await this.input.llm.create({
          messages: this.memory.messages.slice(),
          tools: this.useNativeToolCalling ? tools : void 0,
          abortSignal: signal,
          stream: this.input.stream !== false
        }).observe((llmEmitter) => {
          parser.emitter.on("update", async ({ value, key, field }) => {
            if (key === "tool_output" && parser.isDone) {
              return;
            }
            await emitter.emit("update", {
              data: parser.finalState,
              update: {
                key,
                value: field.raw,
                parsedValue: value
              },
              meta: {
                success: true,
                ...meta
              },
              memory: this.memory
            });
          });
          parser.emitter.on("partialUpdate", async ({ key, delta, value }) => {
            await emitter.emit("partialUpdate", {
              data: parser.finalState,
              update: {
                key,
                value: delta,
                parsedValue: value
              },
              meta: {
                success: true,
                ...meta
              }
            });
          });
          llmEmitter.on("newToken", async ({ value, callbacks }) => {
            if (parser.isDone) {
              callbacks.abort();
              return;
            }
            await parser.add(value.getTextContent());
            if (parser.partialState.tool_output !== void 0) {
              callbacks.abort();
            }
          });
        });
        await parser.end();
        await this.memory.deleteMany(this.memory.messages.filter((msg) => object_cjs.getProp(msg.meta, [
          tempMessageKey
        ]) === true));
        return {
          state: parser.finalState,
          raw
        };
      }, "executor"),
      config: {
        maxRetries: this.options.execution?.maxRetriesPerStep,
        signal
      }
    }).get();
  }
  async tool({ state, signal, meta, emitter }) {
    const tool = this.input.tools.find((tool2) => tool2.name.trim().toUpperCase() == state.tool_name?.trim()?.toUpperCase());
    if (!tool) {
      this.failedAttemptsCounter.use(new base_cjs$1.AgentError(`Agent was trying to use non-existing tool "${state.tool_name}"`, [], {
        context: {
          state,
          meta
        }
      }));
      return {
        success: false,
        output: this.templates.toolNotFoundError.render({
          tools: this.input.tools
        })
      };
    }
    return new retryable_cjs.Retryable({
      config: {
        signal,
        maxRetries: this.options.execution?.maxRetriesPerStep
      },
      onError: /* @__PURE__ */ __name(async (error) => {
        await emitter.emit("toolError", {
          data: {
            iteration: state,
            tool,
            input: state.tool_input,
            options: this.options,
            error: errors_cjs.FrameworkError.ensure(error)
          },
          meta
        });
        this.failedAttemptsCounter.use(error);
      }, "onError"),
      executor: /* @__PURE__ */ __name(async () => {
        const toolOptions = utils_cjs.shallowCopy(this.options);
        try {
          await emitter.emit("toolStart", {
            data: {
              tool,
              input: state.tool_input,
              options: toolOptions,
              iteration: state
            },
            meta
          });
          const toolOutput = await tool.run(state.tool_input, toolOptions).context({
            [base_cjs$2.Tool.contextKeys.Memory]: this.memory
          });
          await emitter.emit("toolSuccess", {
            data: {
              tool,
              input: state.tool_input,
              options: toolOptions,
              result: toolOutput,
              iteration: state
            },
            meta
          });
          if (toolOutput.isEmpty()) {
            return {
              output: this.templates.toolNoResultError.render({}),
              success: true
            };
          }
          return {
            success: true,
            output: toolOutput.getTextContent()
          };
        } catch (error) {
          await emitter.emit("toolError", {
            data: {
              tool,
              input: state.tool_input,
              options: toolOptions,
              error,
              iteration: state
            },
            meta
          });
          if (error instanceof base_cjs$2.ToolInputValidationError) {
            this.failedAttemptsCounter.use(error);
            return {
              success: false,
              output: this.templates.toolInputError.render({
                reason: error.toString()
              })
            };
          }
          if (error instanceof base_cjs$2.ToolError) {
            this.failedAttemptsCounter.use(error);
            return {
              success: false,
              output: this.templates.toolError.render({
                reason: error.explain()
              })
            };
          }
          throw error;
        }
      }, "executor")
    }).get();
  }
  get renderers() {
    const self = {
      user: {
        message: /* @__PURE__ */ __name(({ prompt }) => prompt !== null || this.input.memory.isEmpty() ? new message_cjs.UserMessage(prompt || this.templates.userEmpty.render({})) : void 0, "message")
      },
      system: {
        variables: {
          tools: /* @__PURE__ */ __name(async () => {
            return await Promise.all(this.input.tools.map(async (tool) => ({
              name: tool.name,
              description: tool.description.replaceAll("\n", ".").replace(/\.$/, "").concat("."),
              schema: JSON.stringify(await tool.getInputJsonSchema(), /* @__PURE__ */ (() => {
                const ignoredKeys = /* @__PURE__ */ new Set([
                  "minLength",
                  "maxLength",
                  "$schema"
                ]);
                return (key, value) => ignoredKeys.has(key) ? void 0 : value;
              })())
            })));
          }, "tools")
        },
        message: /* @__PURE__ */ __name(async () => new message_cjs.SystemMessage(this.templates.system.render({
          tools: await self.system.variables.tools(),
          instructions: void 0,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        }), {
          createdAt: /* @__PURE__ */ new Date()
        }), "message")
      }
    };
    return self;
  }
  async initMemory({ prompt }) {
    const { memory: history } = this.input;
    const prevConversation = [
      ...history.messages,
      this.renderers.user.message({
        prompt
      })
    ].filter(remeda.isTruthy).map((message) => {
      if (message.role === message_cjs.Role.USER) {
        const isEmpty = !message.text.trim();
        const text = isEmpty ? (this.templates?.userEmpty ?? prompts_cjs.ReActAgentUserEmptyPrompt).render({}) : (this.templates?.user ?? prompts_cjs.ReActAgentUserPrompt).render({
          input: message.text,
          meta: {
            ...message?.meta,
            createdAt: message?.meta?.createdAt?.toISOString?.()
          }
        });
        return new message_cjs.UserMessage(text, message.meta);
      }
      return message;
    });
    const memory = new tokenMemory_cjs.TokenMemory({
      capacityThreshold: 0.85,
      syncThreshold: 0.5,
      handlers: {
        removalSelector(curMessages) {
          const prevConversationMessage = curMessages.find((msg) => prevConversation.includes(msg));
          if (prevConversationMessage && prevConversationMessage !== remeda.last(prevConversation)) {
            return prevConversationMessage;
          }
          const lastMessage = curMessages.length > 3 ? curMessages.find((msg) => msg.role === message_cjs.Role.ASSISTANT && object_cjs.getProp(msg, [
            "ctx",
            "success"
          ]) === false) ?? curMessages.find((msg) => msg.role === message_cjs.Role.ASSISTANT) : null;
          if (!lastMessage) {
            throw new base_cjs$1.AgentError("Cannot fit the current conversation into the context window!");
          }
          return lastMessage;
        }
      }
    });
    await memory.addMany([
      await this.renderers.system.message(),
      ...prevConversation
    ]);
    return memory;
  }
  createParser(tools) {
    const parser = new linePrefix_cjs.LinePrefixParser({
      thought: {
        prefix: "Thought:",
        next: [
          "tool_name",
          "final_answer"
        ],
        isStart: true,
        field: new field_cjs.ZodParserField(zod.z.string().min(1))
      },
      tool_name: {
        prefix: "Function Name:",
        next: [
          "tool_input"
        ],
        field: new field_cjs.ZodParserField(zod.z.pipeline(zod.z.string().trim(), zod.z.enum(tools.map((tool) => tool.name))))
      },
      tool_input: {
        prefix: "Function Input:",
        next: [
          "tool_output"
        ],
        isEnd: true,
        field: new field_cjs.JSONParserField({
          schema: zod.z.object({}).passthrough(),
          base: {},
          matchPair: [
            "{",
            "}"
          ]
        })
      },
      tool_output: {
        prefix: "Function Output:",
        next: [
          "final_answer"
        ],
        isEnd: true,
        field: new field_cjs.ZodParserField(zod.z.string())
      },
      final_answer: {
        prefix: "Final Answer:",
        next: [],
        isStart: true,
        isEnd: true,
        field: new field_cjs.ZodParserField(zod.z.string().min(1))
      }
    }, {
      waitForStartNode: true,
      endOnRepeat: true,
      fallback: /* @__PURE__ */ __name((stash) => stash ? [
        {
          key: "thought",
          value: "I now know the final answer."
        },
        {
          key: "final_answer",
          value: stash
        }
      ] : [], "fallback")
    });
    return {
      parser
    };
  }
}
_ts_decorate([
  decoratorCache_cjs.Cache({
    enumerable: false
  }),
  _ts_metadata("design:type", void 0),
  _ts_metadata("design:paramtypes", [])
], DefaultRunner.prototype, "defaultTemplates", null);
_ts_decorate([
  decoratorCache_cjs.Cache({
    enumerable: false
  }),
  _ts_metadata("design:type", void 0),
  _ts_metadata("design:paramtypes", [])
], DefaultRunner.prototype, "renderers", null);

exports.DefaultRunner = DefaultRunner;
//# sourceMappingURL=runner.cjs.map
//# sourceMappingURL=runner.cjs.map