'use strict';

var workflow_cjs = require('./workflow.cjs');
var message_cjs = require('../backend/message.cjs');
var zod = require('zod');
var unconstrainedMemory_cjs = require('../memory/unconstrainedMemory.cjs');
var base_cjs = require('../agents/base.cjs');
var remeda = require('remeda');
var agent_cjs = require('../agents/toolCalling/agent.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class AgentWorkflow {
  static {
    __name(this, "AgentWorkflow");
  }
  workflow;
  schema = zod.z.object({
    inputs: zod.z.array(zod.z.object({
      prompt: zod.z.string().optional(),
      context: zod.z.string().optional(),
      expectedOutput: zod.z.union([
        zod.z.string(),
        zod.z.instanceof(zod.z.ZodSchema)
      ]).optional()
    })),
    finalAnswer: zod.z.string().optional(),
    newMessages: zod.z.array(zod.z.instanceof(message_cjs.Message)).default([])
  });
  constructor(name = "AgentWorkflow") {
    this.workflow = new workflow_cjs.Workflow({
      name,
      schema: this.schema,
      outputSchema: this.schema.required()
    });
  }
  run(inputs, options = {}) {
    return this.workflow.run({
      inputs: inputs.map((input) => input instanceof message_cjs.Message ? {
        prompt: input.text
      } : input)
    }, options);
  }
  addAgent(agent) {
    if (agent instanceof base_cjs.BaseAgent) {
      return agent.clone().then((clone) => {
        const factory = /* @__PURE__ */ __name((memory) => {
          clone.memory = memory;
          return clone;
        }, "factory");
        return this._add(clone.meta.name, factory);
      });
    }
    const name = agent.name || `Agent${remeda.randomString(4)}`;
    return this._add(name, remeda.isFunction(agent) ? agent : this._createFactory(agent));
  }
  delAgent(name) {
    return this.workflow.delStep(name);
  }
  _createFactory(input) {
    return (memory) => new agent_cjs.ToolCallingAgent({
      llm: input.llm,
      tools: input.tools ?? [],
      memory,
      meta: {
        name: input.name || `Agent${remeda.randomString(4)}`,
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
      const memory = new unconstrainedMemory_cjs.UnconstrainedMemory();
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
        state.newMessages.push(new message_cjs.UserMessage(runInput.prompt));
      }
      state.newMessages.push(result);
    });
    return this;
  }
}

exports.AgentWorkflow = AgentWorkflow;
//# sourceMappingURL=agent.cjs.map
//# sourceMappingURL=agent.cjs.map