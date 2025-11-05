'use strict';

var message_cjs = require('../../../../backend/message.cjs');
var runner_cjs = require('../default/runner.cjs');
var prompts_cjs$1 = require('./prompts.cjs');
var prompts_cjs = require('../../prompts.cjs');
var decoratorCache_cjs = require('../../../../cache/decoratorCache.cjs');

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
class GraniteRunner extends runner_cjs.DefaultRunner {
  static {
    __name(this, "GraniteRunner");
  }
  useNativeToolCalling = true;
  get defaultTemplates() {
    return {
      system: prompts_cjs$1.GraniteReActAgentSystemPrompt,
      assistant: prompts_cjs$1.GraniteReActAgentAssistantPrompt,
      user: prompts_cjs$1.GraniteReActAgentUserPrompt,
      schemaError: prompts_cjs$1.GraniteReActAgentSchemaErrorPrompt,
      toolNotFoundError: prompts_cjs$1.GraniteReActAgentToolNotFoundPrompt,
      toolError: prompts_cjs$1.GraniteReActAgentToolErrorPrompt,
      toolInputError: prompts_cjs$1.GraniteReActAgentToolInputErrorPrompt,
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
    run.emitter.on("update", async ({ update, meta, memory, data }) => {
      if (update.key === "tool_output") {
        await memory.add(new message_cjs.ToolMessage({
          type: "tool-result",
          result: update.value,
          toolName: data.tool_name,
          isError: !meta.success,
          toolCallId: "DUMMY_ID"
        }, {
          success: meta.success
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
        options,
        nodes: {
          ...nodes,
          thought: {
            ...nodes.thought,
            prefix: "Thought:"
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
          final_answer: {
            ...nodes.final_answer,
            prefix: "Final Answer:"
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
], GraniteRunner.prototype, "defaultTemplates", null);

exports.GraniteRunner = GraniteRunner;
//# sourceMappingURL=runner.cjs.map
//# sourceMappingURL=runner.cjs.map