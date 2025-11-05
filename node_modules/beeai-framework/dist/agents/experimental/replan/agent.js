import { Emitter } from '../../../emitter/emitter.js';
import { BaseAgent, AgentError } from '../../base.js';
import { UserMessage, AssistantMessage } from '../../../backend/message.js';
import { RePlanAssistantPrompt, createRePlanOutputSchema } from './prompts.js';
import { UnconstrainedMemory } from '../../../memory/unconstrainedMemory.js';
import { Tool } from '../../../tools/base.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class RePlanAgent extends BaseAgent {
  static {
    __name(this, "RePlanAgent");
  }
  input;
  emitter;
  constructor(input) {
    super(), this.input = input, this.emitter = Emitter.root.child({
      namespace: [
        "agent",
        "rePlan"
      ],
      creator: this
    });
  }
  async _run(input, _options, context) {
    if (input.prompt !== null) {
      await this.memory.add(new UserMessage(input.prompt));
    }
    const runner = await this.createRunner(context);
    let finalMessage = void 0;
    while (!finalMessage) {
      const state = await runner.run();
      if (state.nextStep.type === "message") {
        finalMessage = new UserMessage(state.nextStep.message);
      } else if (state.nextStep.type === "tool") {
        const toolResults = await runner.tools(state.nextStep.calls);
        await runner.memory.add(new AssistantMessage(RePlanAssistantPrompt.render({
          results: JSON.stringify(toolResults)
        })));
      }
    }
    await this.memory.add(finalMessage);
    return {
      message: finalMessage,
      intermediateMemory: runner.memory
    };
  }
  async createRunner(context) {
    const memory = new UnconstrainedMemory();
    await memory.addMany(this.memory.messages);
    const run = /* @__PURE__ */ __name(async () => {
      const schema = await createRePlanOutputSchema(this.input.tools);
      const response = await this.input.llm.createStructure({
        schema: schema.definition,
        abortSignal: context.signal,
        messages: memory.messages
      });
      await memory.add(new AssistantMessage(JSON.stringify(response)));
      await context.emitter.emit("update", {
        state: response.object
      });
      return response.object;
    }, "run");
    const tools = /* @__PURE__ */ __name(async (calls) => {
      return await Promise.all(calls.map(async (call) => {
        const tool = this.input.tools.find((tool2) => tool2.name === call.name);
        if (!tool) {
          throw new AgentError(`Tool ${call.name} does not exist.`);
        }
        const meta = {
          input: call,
          tool,
          calls
        };
        await context.emitter.emit("tool", {
          type: "start",
          ...meta
        });
        try {
          const output = await tool.run(call.input, {
            signal: context.signal
          }).context({
            [Tool.contextKeys.Memory]: memory
          });
          await context.emitter.emit("tool", {
            type: "success",
            ...meta,
            output
          });
          return output;
        } catch (error) {
          await context.emitter.emit("tool", {
            type: "error",
            ...meta,
            error
          });
          throw error;
        }
      }));
    }, "tools");
    return {
      memory,
      run,
      tools
    };
  }
  get memory() {
    return this.input.memory;
  }
  set memory(memory) {
    this.input.memory = memory;
  }
}

export { RePlanAgent };
//# sourceMappingURL=agent.js.map
//# sourceMappingURL=agent.js.map