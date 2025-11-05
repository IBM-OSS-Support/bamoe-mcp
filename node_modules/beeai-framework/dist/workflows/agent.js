import { Workflow } from './workflow.js';
import { Message, UserMessage } from '../backend/message.js';
import { z } from 'zod';
import { UnconstrainedMemory } from '../memory/unconstrainedMemory.js';
import { BaseAgent } from '../agents/base.js';
import { randomString, isFunction } from 'remeda';
import { ToolCallingAgent } from '../agents/toolCalling/agent.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class AgentWorkflow {
  static {
    __name(this, "AgentWorkflow");
  }
  workflow;
  schema = z.object({
    inputs: z.array(z.object({
      prompt: z.string().optional(),
      context: z.string().optional(),
      expectedOutput: z.union([
        z.string(),
        z.instanceof(z.ZodSchema)
      ]).optional()
    })),
    finalAnswer: z.string().optional(),
    newMessages: z.array(z.instanceof(Message)).default([])
  });
  constructor(name = "AgentWorkflow") {
    this.workflow = new Workflow({
      name,
      schema: this.schema,
      outputSchema: this.schema.required()
    });
  }
  run(inputs, options = {}) {
    return this.workflow.run({
      inputs: inputs.map((input) => input instanceof Message ? {
        prompt: input.text
      } : input)
    }, options);
  }
  addAgent(agent) {
    if (agent instanceof BaseAgent) {
      return agent.clone().then((clone) => {
        const factory = /* @__PURE__ */ __name((memory) => {
          clone.memory = memory;
          return clone;
        }, "factory");
        return this._add(clone.meta.name, factory);
      });
    }
    const name = agent.name || `Agent${randomString(4)}`;
    return this._add(name, isFunction(agent) ? agent : this._createFactory(agent));
  }
  delAgent(name) {
    return this.workflow.delStep(name);
  }
  _createFactory(input) {
    return (memory) => new ToolCallingAgent({
      llm: input.llm,
      tools: input.tools ?? [],
      memory,
      meta: {
        name: input.name || `Agent${randomString(4)}`,
        description: input.instructions ?? ""
      },
      execution: input.execution,
      ...input.instructions && {
        templates: {
          system: /* @__PURE__ */ __name((template) => template.fork((config) => {
            config.defaults.instructions = input.instructions || config.defaults.instructions;
            config.defaults.role = input.role || config.defaults.role;
          }), "system")
        }
      }
    });
  }
  _add(name, factory) {
    this.workflow.addStep(name, async (state, ctx) => {
      const memory = new UnconstrainedMemory();
      await memory.addMany(state.newMessages);
      const runInput = state.inputs.shift() ?? {
        prompt: void 0
      };
      const agent = await factory(memory.asReadOnly());
      const { result } = await agent.run(runInput, {
        signal: ctx.signal
      });
      state.finalAnswer = result.text;
      if (runInput.prompt) {
        state.newMessages.push(new UserMessage(runInput.prompt));
      }
      state.newMessages.push(result);
    });
    return this;
  }
}

export { AgentWorkflow };
//# sourceMappingURL=agent.js.map
//# sourceMappingURL=agent.js.map