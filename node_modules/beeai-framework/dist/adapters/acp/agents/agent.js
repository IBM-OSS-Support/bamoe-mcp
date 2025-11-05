import { Emitter } from '../../../emitter/emitter.js';
import { BaseAgent, AgentError } from '../../../agents/base.js';
import { AssistantMessage, Message, UserMessage } from '../../../backend/message.js';
import { shallowCopy } from '../../../serializer/utils.js';
import { RestfulClient } from '../../../internals/fetcher.js';
import { toCamelCase } from 'remeda';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class ACPAgent extends BaseAgent {
  static {
    __name(this, "ACPAgent");
  }
  input;
  emitter;
  client;
  constructor(input) {
    super(), this.input = input;
    this.emitter = Emitter.root.child({
      namespace: [
        "agent",
        "acp",
        toCamelCase(this.input.agentName)
      ],
      creator: this
    });
    this.client = new RestfulClient({
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
      throw new AgentError("No event received from agent.");
    }
    if (eventData.type === "run.failed") {
      const message = eventData.run?.error?.message || "Something went wrong with the agent communication.";
      await context.emitter.emit("error", {
        message
      });
      throw new AgentError(message);
    } else if (eventData.type === "run.completed") {
      const text = eventData.run.output.reduce((acc, output) => acc + output.parts.reduce((acc2, part) => acc2 + part.content, ""), "");
      const assistantMessage = new AssistantMessage(text, {
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
        result: new AssistantMessage("No response from agent."),
        event: eventData
      };
    }
  }
  async checkAgentExists() {
    try {
      const response = await this.client.fetch("agents");
      return !!response.agents.find((agent) => agent.name === this.input.agentName);
    } catch (error) {
      throw new AgentError(`Error while checking agent existence: ${error.message}`, [], {
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
      input: shallowCopy(this.input),
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
    } else if (input instanceof Message) {
      return {
        parts: [
          {
            content: input.content,
            role: input.role
          }
        ]
      };
    } else {
      throw new AgentError("Unsupported input type");
    }
  }
  convertToMessage(input) {
    if (typeof input === "string") {
      return new UserMessage(input);
    } else if (input instanceof Message) {
      return input;
    } else {
      throw new AgentError("Unsupported input type");
    }
  }
}

export { ACPAgent };
//# sourceMappingURL=agent.js.map
//# sourceMappingURL=agent.js.map