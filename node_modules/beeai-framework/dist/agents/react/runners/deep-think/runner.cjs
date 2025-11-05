'use strict';

var runner_cjs = require('../default/runner.cjs');
var prompts_cjs$1 = require('./prompts.cjs');
var prompts_cjs = require('../../prompts.cjs');
var decoratorCache_cjs = require('../../../../cache/decoratorCache.cjs');
var field_cjs = require('../../../../parsers/field.cjs');
var zod = require('zod');
var message_cjs = require('../../../../backend/message.cjs');

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
class DeepThinkRunner extends runner_cjs.DefaultRunner {
  static {
    __name(this, "DeepThinkRunner");
  }
  get defaultTemplates() {
    return {
      system: prompts_cjs$1.DeepThinkReActAgentSystemPrompt,
      assistant: prompts_cjs$1.DeepThinkReActAgentAssistantPrompt,
      user: prompts_cjs$1.DeepThinkReActAgentUserPrompt,
      schemaError: prompts_cjs$1.DeepThinkReActAgentSchemaErrorPrompt,
      toolNotFoundError: prompts_cjs$1.DeepThinkReActAgentToolNotFoundPrompt,
      toolError: prompts_cjs$1.DeepThinkReActAgentToolErrorPrompt,
      toolInputError: prompts_cjs$1.DeepThinkReActAgentToolInputErrorPrompt,
      // Note: These are from ReAct
      userEmpty: prompts_cjs.ReActAgentUserEmptyPrompt,
      toolNoResultError: prompts_cjs.ReActAgentToolNoResultsPrompt
    };
  }
  static {
    this.register();
  }
  constructor(input, options, run) {
    super(input, options, run);
    run.emitter.on("update", async ({ update, meta, memory }) => {
      if (update.key === "tool_output") {
        await memory.add(new message_cjs.UserMessage(update.value, {
          success: meta.success,
          createdAt: /* @__PURE__ */ new Date()
        }));
      }
    }, {
      isBlocking: true
    });
  }
  createParser(tools) {
    const { parser } = super.createParser(tools);
    return {
      parser: parser.fork((nodes, options) => ({
        options: {
          ...options,
          // @ts-expect-error
          silentNodes: [
            ...options?.silentNodes ?? [],
            "dummy_thought_end"
          ]
        },
        nodes: {
          ...nodes,
          thought: {
            ...nodes.thought,
            prefix: "<think>",
            // @ts-expect-error
            next: [
              "dummy_thought_end"
            ],
            isStart: true,
            field: new field_cjs.ZodParserField(zod.z.string().min(1))
          },
          dummy_thought_end: {
            prefix: "</think>",
            isDummy: true,
            next: [
              "tool_name",
              "final_answer"
            ],
            field: new field_cjs.ZodParserField(zod.z.string().transform((_) => ""))
          },
          tool_name: {
            ...nodes.tool_name,
            prefix: "Tool Name:"
          },
          tool_input: {
            ...nodes.tool_input,
            prefix: "Tool Input:",
            isEnd: true,
            next: []
          },
          tool_output: {
            ...nodes.tool_name,
            prefix: "Tool Output:"
          },
          final_answer: {
            ...nodes.final_answer,
            prefix: "Response:"
          }
        }
      }))
    };
  }
}
_ts_decorate([
  decoratorCache_cjs.Cache({
    enumerable: false
  }),
  _ts_metadata("design:type", void 0),
  _ts_metadata("design:paramtypes", [])
], DeepThinkRunner.prototype, "defaultTemplates", null);

exports.DeepThinkRunner = DeepThinkRunner;
//# sourceMappingURL=runner.cjs.map
//# sourceMappingURL=runner.cjs.map