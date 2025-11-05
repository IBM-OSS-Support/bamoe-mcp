'use strict';

var serializable_cjs = require('../internals/serializable.cjs');
var utils_cjs = require('../serializer/utils.cjs');
var object_cjs = require('../internals/helpers/object.cjs');
var number_cjs = require('../internals/helpers/number.cjs');
var context_cjs = require('../context.cjs');
var remeda = require('remeda');
var decoratorCache_cjs = require('../cache/decoratorCache.cjs');
var promiseBasedTask = require('promise-based-task');
var nullCache_cjs = require('../cache/nullCache.cjs');
var utils_cjs$1 = require('./utils.cjs');
var base_cjs = require('../tools/base.cjs');
var message_cjs = require('./message.cjs');
var errors_cjs = require('./errors.cjs');
var zod = require('zod');
var schema_cjs = require('../internals/helpers/schema.cjs');
var retryable_cjs = require('../internals/helpers/retryable.cjs');
var template_cjs = require('../template.cjs');
var promise_cjs = require('../internals/helpers/promise.cjs');
var serializer_cjs = require('../serializer/serializer.cjs');
var logger_cjs = require('../logger/logger.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class ChatModel extends serializable_cjs.Serializable {
  static {
    __name(this, "ChatModel");
  }
  cache = new nullCache_cjs.NullCache();
  parameters = {};
  logger = logger_cjs.Logger.root.child({
    name: this.constructor.name
  });
  toolChoiceSupport = [
    "required",
    "none",
    "single",
    "auto"
  ];
  toolCallFallbackViaResponseFormat = true;
  modelSupportsToolCalling = true;
  create(input) {
    input = utils_cjs.shallowCopy(input);
    return context_cjs.RunContext.enter(this, {
      params: [
        input
      ],
      signal: input?.abortSignal
    }, async (run) => {
      if (!this.modelSupportsToolCalling) {
        input.tools = [];
      }
      const forceToolCallViaResponseFormat = this.shouldForceToolCallViaResponseFormat(input);
      if (forceToolCallViaResponseFormat && input.tools && !remeda.isEmpty(input.tools)) {
        input.responseFormat = await utils_cjs$1.generateToolUnionSchema(utils_cjs$1.filterToolsByToolChoice(input.tools, input.toolChoice));
        input.toolChoice = void 0;
      }
      if (!this.isToolChoiceSupported(input.toolChoice)) {
        this.logger.warn(`The following tool choice value '${input.toolChoice}' is not supported. Ignoring.`);
        input.toolChoice = void 0;
      }
      const cacheEntry = await this.createCacheAccessor(input);
      try {
        await run.emitter.emit("start", {
          input
        });
        const chunks = [];
        const generator = cacheEntry.value ?? (input.stream ? this._createStream(input, run) : promise_cjs.toAsyncGenerator(this._create(input, run)));
        const controller = new AbortController();
        for await (const value of generator) {
          chunks.push(value);
          await run.emitter.emit("newToken", {
            value,
            callbacks: {
              abort: /* @__PURE__ */ __name(() => controller.abort(), "abort")
            }
          });
          if (controller.signal.aborted) {
            break;
          }
        }
        cacheEntry.resolve(chunks);
        const result = ChatModelOutput.fromChunks(chunks);
        if (forceToolCallViaResponseFormat && remeda.isEmpty(result.getToolCalls())) {
          const lastMsg = result.messages.at(-1);
          const toolCall = schema_cjs.parseBrokenJson(lastMsg.text);
          if (!toolCall) {
            throw new errors_cjs.ChatModelError(`Failed to produce a valid tool call. Generate output: ${lastMsg.text}`, [], {
              isFatal: true,
              isRetryable: false
            });
          }
          lastMsg.content.length = 0;
          lastMsg.content.push({
            type: "tool-call",
            toolCallId: `call_${remeda.randomString(8).toLowerCase()}`,
            toolName: toolCall.name,
            // todo: add types
            args: toolCall.parameters
          });
        }
        await run.emitter.emit("success", {
          value: result
        });
        return result;
      } catch (error) {
        await run.emitter.emit("error", {
          input,
          error
        });
        await cacheEntry.reject(error);
        if (error instanceof errors_cjs.ChatModelError) {
          throw error;
        } else {
          throw new errors_cjs.ChatModelError(`The Chat Model has encountered an error.`, [
            error
          ]);
        }
      } finally {
        await run.emitter.emit("finish", null);
      }
    });
  }
  createStructure(input) {
    return context_cjs.RunContext.enter(this, {
      params: [
        input
      ],
      signal: input?.abortSignal
    }, async (run) => {
      return await this._createStructure(input, run);
    });
  }
  config({ cache, parameters }) {
    if (cache) {
      this.cache = remeda.isFunction(cache) ? cache(this.cache) : cache;
    }
    if (parameters) {
      this.parameters = remeda.isFunction(parameters) ? parameters(this.parameters) : parameters;
    }
  }
  static async fromName(name, options) {
    const { providerId, modelId } = utils_cjs$1.parseModel(name);
    const Target = await utils_cjs$1.loadModel(providerId, "chat");
    return new Target(modelId || void 0, options);
  }
  async _createStructure(input, run) {
    const { schema, ...options } = input;
    const jsonSchema = schema_cjs.toJsonSchema(schema);
    const systemTemplate = input.systemPromptTemplate ?? new template_cjs.PromptTemplate({
      schema: zod.z.object({
        schema: zod.z.string().min(1)
      }),
      template: `You are a helpful assistant that generates only valid JSON adhering to the following JSON Schema.

\`\`\`
{{schema}}
\`\`\`

IMPORTANT: You MUST answer with a JSON object that matches the JSON schema above.`
    });
    const messages = [
      new message_cjs.SystemMessage(systemTemplate.render({
        schema: JSON.stringify(jsonSchema, null, 2)
      })),
      ...input.messages
    ];
    const errorTemplate = new template_cjs.PromptTemplate({
      schema: zod.z.object({
        errors: zod.z.string(),
        expected: zod.z.string(),
        received: zod.z.string()
      }),
      template: `Generated object does not match the expected JSON schema!

Validation Errors: {{errors}}`
    });
    return new retryable_cjs.Retryable({
      executor: /* @__PURE__ */ __name(async () => {
        const response = await this._create({
          ...options,
          messages,
          responseFormat: {
            type: "object-json"
          }
        }, run);
        const textResponse = response.getTextContent();
        const object = schema_cjs.parseBrokenJson(textResponse, {
          pair: [
            "{",
            "}"
          ]
        });
        const validator = schema_cjs.createSchemaValidator(schema);
        const success = validator(object);
        if (!success) {
          const context = {
            expected: JSON.stringify(jsonSchema),
            received: textResponse,
            errors: JSON.stringify(validator.errors ?? [])
          };
          messages.push(new message_cjs.UserMessage(errorTemplate.render(context)));
          throw new errors_cjs.ChatModelError(`LLM did not produce a valid output.`, [], {
            context
          });
        }
        return {
          object,
          output: response
        };
      }, "executor"),
      config: {
        signal: run.signal,
        maxRetries: input?.maxRetries || 1
      }
    }).get();
  }
  createSnapshot() {
    return {
      cache: this.cache,
      emitter: this.emitter,
      parameters: utils_cjs.shallowCopy(this.parameters),
      logger: this.logger,
      toolChoiceSupport: this.toolChoiceSupport.slice(),
      toolCallFallbackViaResponseFormat: this.toolCallFallbackViaResponseFormat,
      modelSupportsToolCalling: this.modelSupportsToolCalling
    };
  }
  destroy() {
    this.emitter.destroy();
  }
  async createCacheAccessor({ abortSignal: _, messages, tools = [], ...input }) {
    const key = decoratorCache_cjs.ObjectHashKeyFn({
      ...input,
      messages: await serializer_cjs.Serializer.serialize(messages.map((msg) => msg.toPlain())),
      tools: await serializer_cjs.Serializer.serialize(tools)
    });
    const value = await this.cache.get(key);
    const isNew = value === void 0;
    let task = null;
    if (isNew) {
      task = new promiseBasedTask.Task();
      await this.cache.set(key, task);
    }
    return {
      key,
      value,
      resolve: /* @__PURE__ */ __name((value2) => {
        task?.resolve?.(value2);
      }, "resolve"),
      reject: /* @__PURE__ */ __name(async (error) => {
        task?.reject?.(error);
        if (isNew) {
          await this.cache.delete(key);
        }
      }, "reject")
    };
  }
  shouldForceToolCallViaResponseFormat({ tools = [], toolChoice, responseFormat }) {
    if (remeda.isEmpty(tools) || !toolChoice || toolChoice === "none" || toolChoice === "auto" || !this.toolCallFallbackViaResponseFormat || Boolean(responseFormat)) {
      return false;
    }
    const toolChoiceSupported = this.isToolChoiceSupported(toolChoice);
    return !this.modelSupportsToolCalling || !toolChoiceSupported;
  }
  isToolChoiceSupported(choice) {
    return !choice || (choice instanceof base_cjs.Tool ? this.toolChoiceSupport.includes("single") : this.toolChoiceSupport.includes(choice));
  }
}
class ChatModelOutput extends serializable_cjs.Serializable {
  static {
    __name(this, "ChatModelOutput");
  }
  messages;
  usage;
  finishReason;
  constructor(messages, usage, finishReason) {
    super(), this.messages = messages, this.usage = usage, this.finishReason = finishReason;
  }
  static fromChunks(chunks) {
    const final = new ChatModelOutput([]);
    chunks.forEach((cur) => final.merge(cur));
    return final;
  }
  merge(other) {
    this.messages.push(...other.messages);
    this.finishReason = other.finishReason;
    if (this.usage && other.usage) {
      this.usage = object_cjs.customMerge([
        this.usage,
        other.usage
      ], {
        totalTokens: number_cjs.takeBigger,
        promptTokens: number_cjs.takeBigger,
        completionTokens: number_cjs.takeBigger
      });
    } else if (other.usage) {
      this.usage = utils_cjs.shallowCopy(other.usage);
    }
  }
  getToolCalls() {
    return this.messages.filter((r) => r instanceof message_cjs.AssistantMessage).flatMap((r) => r.getToolCalls()).filter(Boolean);
  }
  getTextMessages() {
    return this.messages.filter((r) => r instanceof message_cjs.AssistantMessage).filter((r) => r.text);
  }
  getTextContent() {
    return this.messages.filter((r) => r instanceof message_cjs.AssistantMessage).flatMap((r) => r.text).filter(Boolean).join("");
  }
  toString() {
    return this.getTextContent();
  }
  createSnapshot() {
    return {
      messages: utils_cjs.shallowCopy(this.messages),
      usage: utils_cjs.shallowCopy(this.usage),
      finishReason: this.finishReason
    };
  }
  loadSnapshot(snapshot) {
    Object.assign(this, snapshot);
  }
}

exports.ChatModel = ChatModel;
exports.ChatModelOutput = ChatModelOutput;
//# sourceMappingURL=chat.cjs.map
//# sourceMappingURL=chat.cjs.map