import { ToolMessage } from '../../../../backend/message.js';
import { DefaultRunner } from '../default/runner.js';
import { GraniteReActAgentToolInputErrorPrompt, GraniteReActAgentToolErrorPrompt, GraniteReActAgentToolNotFoundPrompt, GraniteReActAgentSchemaErrorPrompt, GraniteReActAgentUserPrompt, GraniteReActAgentAssistantPrompt, GraniteReActAgentSystemPrompt } from './prompts.js';
import { ReActAgentToolNoResultsPrompt, ReActAgentUserEmptyPrompt } from '../../prompts.js';
import { Cache } from '../../../../cache/decoratorCache.js';

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
class GraniteRunner extends DefaultRunner {
  static {
    __name(this, "GraniteRunner");
  }
  useNativeToolCalling = true;
  get defaultTemplates() {
    return {
      system: GraniteReActAgentSystemPrompt,
      assistant: GraniteReActAgentAssistantPrompt,
      user: GraniteReActAgentUserPrompt,
      schemaError: GraniteReActAgentSchemaErrorPrompt,
      toolNotFoundError: GraniteReActAgentToolNotFoundPrompt,
      toolError: GraniteReActAgentToolErrorPrompt,
      toolInputError: GraniteReActAgentToolInputErrorPrompt,
      // Note: These are from ReAct
      userEmpty: ReActAgentUserEmptyPrompt,
      toolNoResultError: ReActAgentToolNoResultsPrompt
    };
  }
  static {
    this.register();
  }
  constructor(input, options, run) {
    super(input, options, run);
    run.emitter.on("update", async ({ update, meta, memory, data }) => {
      if (update.key === "tool_output") {
        await memory.add(new ToolMessage({
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
  Cache({
    enumerable: false
  }),
  _ts_metadata("design:type", void 0),
  _ts_metadata("design:paramtypes", [])
], GraniteRunner.prototype, "defaultTemplates", null);

export { GraniteRunner };
//# sourceMappingURL=runner.js.map
//# sourceMappingURL=runner.js.map