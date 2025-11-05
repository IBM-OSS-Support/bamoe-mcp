import { BaseAgent, AgentError } from '../base.js';
import { DynamicTool, ToolError, StringToolOutput } from '../../tools/base.js';
import { Emitter } from '../../emitter/emitter.js';
import { shallowCopy } from '../../serializer/utils.js';
import { UnconstrainedMemory } from '../../memory/unconstrainedMemory.js';
import { SystemMessage, UserMessage, ToolMessage, AssistantMessage } from '../../backend/message.js';
import { isString, isEmpty } from 'remeda';
import { RetryCounter } from '../../internals/helpers/counter.js';
import { omitUndefined, mapObj } from '../../internals/helpers/object.js';
import { Cache } from '../../cache/decoratorCache.js';
import { PromptTemplate } from '../../template.js';
import { ToolCallingAgentTaskPrompt, ToolCallingAgentSystemPrompt } from './prompts.js';
import { ZodSchema, z } from 'zod';

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
class ToolCallingAgent extends BaseAgent {
  static {
    __name(this, "ToolCallingAgent");
  }
  input;
  emitter;
  constructor(input) {
    super(), this.input = input, this.emitter = Emitter.root.child({
      namespace: [
        "agent",
        "toolCalling"
      ],
      creator: this
    });
    this.input.saveIntermediateSteps = this.input.saveIntermediateSteps ?? true;
  }
  static {
    this.register();
  }
  async _run(input, options = {}, run) {
    const tempMessageKey = "tempMessage";
    const execution = {
      totalMaxRetries: 20,
      ...omitUndefined(this.input.execution ?? {}),
      ...omitUndefined(options.execution ?? {})
    };
    const state = {
      memory: new UnconstrainedMemory(),
      result: void 0,
      iteration: 0
    };
    await state.memory.add(new SystemMessage(this.templates.system.render({
      role: void 0,
      instructions: void 0
    })));
    await state.memory.addMany(this.memory.messages);
    if (input.prompt) {
      const userMessage = new UserMessage(this.templates.task.render({
        prompt: input.prompt,
        context: input.context,
        expectedOutput: isString(input.expectedOutput) ? input.expectedOutput : void 0
      }));
      await state.memory.add(userMessage);
    }
    const globalRetriesCounter = new RetryCounter(execution.totalMaxRetries || 1, AgentError);
    const usePlainResponse = !input.expectedOutput || !(input.expectedOutput instanceof ZodSchema);
    const finalAnswerToolSchema = usePlainResponse ? z.object({
      response: z.string().describe(String(input.expectedOutput ?? ""))
    }) : input.expectedOutput;
    const finalAnswerTool = new DynamicTool({
      name: "final_answer",
      description: "Sends the final answer to the user",
      inputSchema: finalAnswerToolSchema,
      handler: /* @__PURE__ */ __name(async (input2) => {
        const result = usePlainResponse ? input2.response : JSON.stringify(input2);
        state.result = new AssistantMessage(result);
        return new StringToolOutput("Message has been sent");
      }, "handler")
    });
    const tools = [
      ...this.input.tools,
      finalAnswerTool
    ];
    let forceFinalAnswer = false;
    while (!state.result) {
      state.iteration++;
      if (state.iteration > (execution.totalMaxRetries ?? Infinity)) {
        throw new AgentError(`Agent was not able to resolve the task in ${state.iteration} iterations.`);
      }
      await run.emitter.emit("start", {
        state
      });
      const response = await this.input.llm.create({
        messages: state.memory.messages.slice(),
        tools,
        toolChoice: forceFinalAnswer ? finalAnswerTool : tools.length > 1 ? "required" : tools[0],
        stream: false
      });
      await state.memory.addMany(response.messages);
      const toolCallMessages = response.getToolCalls();
      for (const toolCall of toolCallMessages) {
        try {
          const tool = tools.find((tool2) => tool2.name === toolCall.toolName);
          if (!tool) {
            throw new AgentError(`Tool ${toolCall.toolName} does not exist!`);
          }
          const toolInput = toolCall.args;
          const toolResponse = await tool.run(toolInput).context({
            state,
            toolCallMsg: toolCall
          });
          await state.memory.add(new ToolMessage({
            type: "tool-result",
            toolCallId: toolCall.toolCallId,
            toolName: toolCall.toolName,
            result: toolResponse.getTextContent(),
            isError: false
          }));
        } catch (e) {
          if (e instanceof ToolError) {
            globalRetriesCounter.use(e);
            await state.memory.add(new ToolMessage({
              type: "tool-result",
              toolCallId: toolCall.toolCallId,
              toolName: toolCall.toolName,
              result: e.explain(),
              isError: true
            }));
          } else {
            throw e;
          }
        }
      }
      const textMessages = response.getTextMessages();
      if (isEmpty(toolCallMessages) && isEmpty(textMessages)) {
        await state.memory.add(new AssistantMessage("\n", {
          [tempMessageKey]: true
        }));
      } else {
        await state.memory.deleteMany(state.memory.messages.filter((msg) => msg.meta[tempMessageKey]));
      }
      if (!isEmpty(textMessages) && isEmpty(toolCallMessages)) {
        forceFinalAnswer = true;
        tools.length = 0;
        tools.push(finalAnswerTool);
      }
      await run.emitter.emit("success", {
        state
      });
    }
    if (this.input.saveIntermediateSteps) {
      this.memory.reset();
      await this.memory.addMany(state.memory.messages.slice(1));
    } else {
      await this.memory.addMany(state.memory.messages.slice(-2));
    }
    return {
      memory: state.memory,
      result: state.result
    };
  }
  get meta() {
    const tools = this.input.tools.slice();
    if (this.input.meta) {
      return {
        ...this.input.meta,
        tools
      };
    }
    return {
      name: "ToolCalling",
      tools,
      description: "ToolCallingAgent that uses tools to accomplish the task.",
      ...tools.length > 0 && {
        extraDescription: [
          `Tools that I can use to accomplish given task.`,
          ...tools.map((tool) => `Tool '${tool.name}': ${tool.description}.`)
        ].join("\n")
      }
    };
  }
  get templates() {
    const overrides = this.input.templates ?? {};
    const defaultTemplates = {
      system: ToolCallingAgentSystemPrompt,
      task: ToolCallingAgentTaskPrompt
    };
    return mapObj(defaultTemplates)((key, defaultTemplate) => {
      const override = overrides[key] ?? defaultTemplate;
      if (override instanceof PromptTemplate) {
        return override;
      }
      return override(defaultTemplate) ?? defaultTemplate;
    });
  }
  createSnapshot() {
    return {
      ...super.createSnapshot(),
      input: shallowCopy(this.input),
      emitter: this.emitter
    };
  }
  set memory(memory) {
    this.input.memory = memory;
  }
  get memory() {
    return this.input.memory;
  }
}
_ts_decorate([
  Cache({
    enumerable: false
  }),
  _ts_metadata("design:type", typeof ToolCallingAgentTemplates === "undefined" ? Object : ToolCallingAgentTemplates),
  _ts_metadata("design:paramtypes", [])
], ToolCallingAgent.prototype, "templates", null);

export { ToolCallingAgent };
//# sourceMappingURL=agent.js.map
//# sourceMappingURL=agent.js.map