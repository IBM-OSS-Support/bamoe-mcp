import { Emitter } from '../../../emitter/emitter.js';
import { BaseAgent } from '../../../agents/base.js';
import { shallowCopy } from '../../../serializer/utils.js';
import { ACPAgent } from '../../acp/agents/agent.js';
import { toCamelCase } from 'remeda';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class BeeAIPlatformAgent extends BaseAgent {
  static {
    __name(this, "BeeAIPlatformAgent");
  }
  input;
  emitter;
  agent;
  constructor(input) {
    super(), this.input = input;
    this.agent = new ACPAgent(input);
    this.emitter = Emitter.root.child({
      namespace: [
        "agent",
        "beeAIPlatform",
        toCamelCase(this.input.agentName)
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
      input: shallowCopy(this.input),
      agent: this.agent.createSnapshot(),
      emitter: this.emitter
    };
  }
}

export { BeeAIPlatformAgent };
//# sourceMappingURL=agent.js.map
//# sourceMappingURL=agent.js.map