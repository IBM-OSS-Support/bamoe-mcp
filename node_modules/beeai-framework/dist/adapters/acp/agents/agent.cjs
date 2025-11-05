'use strict';

var emitter_cjs = require('../../../emitter/emitter.cjs');
var base_cjs = require('../../../agents/base.cjs');
var message_cjs = require('../../../backend/message.cjs');
var utils_cjs = require('../../../serializer/utils.cjs');
var fetcher_cjs = require('../../../internals/fetcher.cjs');
var remeda = require('remeda');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class ACPAgent extends base_cjs.BaseAgent {
  static {
    __name(this, "ACPAgent");
  }
  input;
  emitter;
  client;
  constructor(input) {
    super(), this.input = input;
    this.emitter = emitter_cjs.Emitter.root.child({
      namespace: [
        "agent",
        "acp",
        remeda.toCamelCase(this.input.agentName)
      ],
      creator: this
    });
    this.client = new fetcher_cjs.RestfulClient({
      baseUrl: this.input.url,
      headers: /* @__PURE__ */ __name(async () => ({
        "Accept": "application/json",
        "Content-Type": "application/json"
      }), "headers"),
      paths: {
        runs: `/runs`,
        agents: `/agents`
      }
    });
  }
  async _run(input, _options, context) {
    const inputs = Array.isArray(input.input) ? input.input.map(this.convertToACPMessage) : [
      this.convertToACPMessage(input.input)
    ];
    const generator = this.client.stream("runs", {
      body: JSON.stringify({
        agent_name: this.input.agentName,
        input: inputs,
        mode: "stream"
      }),
      signal: context.signal
    });
    let eventData = null;
    for await (const event of generator) {
      try {
        eventData = JSON.parse(event.data);
        await context.emitter.emit("update", {
          key: eventData.type,
          value: {
            ...eventData,
            type: void 0
          }
        });
      } catch {
        await context.emitter.emit("error", {
          message: "Error parsing JSON"
        });
      }
    }
    if (!eventData) {
      throw new base_cjs.AgentError("No event received from agent.");
    }
    if (eventData.type === "run.failed") {
      const message = eventData.run?.error?.message || "Something went wrong with the agent communication.";
      await context.emitter.emit("error", {
        message
      });
      throw new base_cjs.AgentError(message);
    } else if (eventData.type === "run.completed") {
      const text = eventData.run.output.reduce((acc, output) => acc + output.parts.reduce((acc2, part) => acc2 + part.content, ""), "");
      const assistantMessage = new message_cjs.AssistantMessage(text, {
        event: eventData
      });
      const inputMessages = Array.isArray(input.input) ? input.input.map(this.convertToMessage) : [
        this.convertToMessage(input.input)
      ];
      await this.memory.addMany(inputMessages);
      await this.memory.add(assistantMessage);
      return {
        result: assistantMessage,
        event: eventData
      };
    } else {
      return {
        result: new message_cjs.AssistantMessage("No response from agent."),
        event: eventData
      };
    }
  }
  async checkAgentExists() {
    try {
      const response = await this.client.fetch("agents");
      return !!response.agents.find((agent) => agent.name === this.input.agentName);
    } catch (error) {
      throw new base_cjs.AgentError(`Error while checking agent existence: ${error.message}`, [], {
        isFatal: true
      });
    }
  }
  get memory() {
    return this.input.memory;
  }
  set memory(memory) {
    this.input.memory = memory;
  }
  createSnapshot() {
    return {
      ...super.createSnapshot(),
      input: utils_cjs.shallowCopy(this.input),
      emitter: this.emitter
    };
  }
  convertToACPMessage(input) {
    if (typeof input === "string") {
      return {
        parts: [
          {
            content: input,
            role: "user"
          }
        ]
      };
    } else if (input instanceof message_cjs.Message) {
      return {
        parts: [
          {
            content: input.content,
            role: input.role
          }
        ]
      };
    } else {
      throw new base_cjs.AgentError("Unsupported input type");
    }
  }
  convertToMessage(input) {
    if (typeof input === "string") {
      return new message_cjs.UserMessage(input);
    } else if (input instanceof message_cjs.Message) {
      return input;
    } else {
      throw new base_cjs.AgentError("Unsupported input type");
    }
  }
}

exports.ACPAgent = ACPAgent;
//# sourceMappingURL=agent.cjs.map
//# sourceMappingURL=agent.cjs.map