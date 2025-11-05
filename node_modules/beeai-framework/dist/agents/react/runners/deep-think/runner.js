import { DefaultRunner } from '../default/runner.js';
import { DeepThinkReActAgentToolInputErrorPrompt, DeepThinkReActAgentToolErrorPrompt, DeepThinkReActAgentToolNotFoundPrompt, DeepThinkReActAgentSchemaErrorPrompt, DeepThinkReActAgentUserPrompt, DeepThinkReActAgentAssistantPrompt, DeepThinkReActAgentSystemPrompt } from './prompts.js';
import { ReActAgentToolNoResultsPrompt, ReActAgentUserEmptyPrompt } from '../../prompts.js';
import { Cache } from '../../../../cache/decoratorCache.js';
import { ZodParserField } from '../../../../parsers/field.js';
import { z } from 'zod';
import { UserMessage } from '../../../../backend/message.js';

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
class DeepThinkRunner extends DefaultRunner {
  static {
    __name(this, "DeepThinkRunner");
  }
  get defaultTemplates() {
    return {
      system: DeepThinkReActAgentSystemPrompt,
      assistant: DeepThinkReActAgentAssistantPrompt,
      user: DeepThinkReActAgentUserPrompt,
      schemaError: DeepThinkReActAgentSchemaErrorPrompt,
      toolNotFoundError: DeepThinkReActAgentToolNotFoundPrompt,
      toolError: DeepThinkReActAgentToolErrorPrompt,
      toolInputError: DeepThinkReActAgentToolInputErrorPrompt,
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
    run.emitter.on("update", async ({ update, meta, memory }) => {
      if (update.key === "tool_output") {
        await memory.add(new UserMessage(update.value, {
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
            field: new ZodParserField(z.string().min(1))
          },
          dummy_thought_end: {
            prefix: "</think>",
            isDummy: true,
            next: [
              "tool_name",
              "final_answer"
            ],
            field: new ZodParserField(z.string().transform((_) => ""))
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
  Cache({
    enumerable: false
  }),
  _ts_metadata("design:type", void 0),
  _ts_metadata("design:paramtypes", [])
], DeepThinkRunner.prototype, "defaultTemplates", null);

export { DeepThinkRunner };
//# sourceMappingURL=runner.js.map
//# sourceMappingURL=runner.js.map