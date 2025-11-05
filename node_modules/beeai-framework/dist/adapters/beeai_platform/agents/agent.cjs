'use strict';

var emitter_cjs = require('../../../emitter/emitter.cjs');
var base_cjs = require('../../../agents/base.cjs');
var utils_cjs = require('../../../serializer/utils.cjs');
var agent_cjs = require('../../acp/agents/agent.cjs');
var remeda = require('remeda');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class BeeAIPlatformAgent extends base_cjs.BaseAgent {
  static {
    __name(this, "BeeAIPlatformAgent");
  }
  input;
  emitter;
  agent;
  constructor(input) {
    super(), this.input = input;
    this.agent = new agent_cjs.ACPAgent(input);
    this.emitter = emitter_cjs.Emitter.root.child({
      namespace: [
        "agent",
        "beeAIPlatform",
        remeda.toCamelCase(this.input.agentName)
      ],
      creator: this
    });
  }
  async _run(input, _options, context) {
    const response = await this.agent.run(input).observe((emitter) => {
      emitter.on("update", async (data, _) => await context.emitter.emit("update", data));
      emitter.on("error", async (data, _) => await context.emitter.emit("error", data));
    });
    return {
      result: response.result,
      event: response.event
    };
  }
  async checkAgentExists() {
    return this.agent.checkAgentExists();
  }
  get memory() {
    return this.agent.memory;
  }
  set memory(memory) {
    this.agent.memory = memory;
  }
  createSnapshot() {
    return {
      ...super.createSnapshot(),
      input: utils_cjs.shallowCopy(this.input),
      agent: this.agent.createSnapshot(),
      emitter: this.emitter
    };
  }
}

exports.BeeAIPlatformAgent = BeeAIPlatformAgent;
//# sourceMappingURL=agent.cjs.map
//# sourceMappingURL=agent.cjs.map