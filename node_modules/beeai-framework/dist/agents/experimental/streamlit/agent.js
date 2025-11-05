import { BaseAgent, AgentError } from '../../base.js';
import { Emitter } from '../../../emitter/emitter.js';
import { isTruthy, last } from 'remeda';
import { AssistantMessage, SystemMessage, UserMessage, Role } from '../../../backend/message.js';
import { StreamlitAgentSystemPrompt } from './prompts.js';
import { TokenMemory } from '../../../memory/tokenMemory.js';
import { findFirstPair } from '../../../internals/helpers/string.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class StreamlitAgent extends BaseAgent {
  static {
    __name(this, "StreamlitAgent");
  }
  input;
  emitter;
  constructor(input) {
    super(), this.input = input, this.emitter = new Emitter({
      namespace: [
        "agent",
        "experimental",
        "streamlit"
      ],
      creator: this
    });
  }
  get meta() {
    return {
      name: `Streamlit`,
      tools: [],
      description: `StreamlitAgent is an experimental meta-app agent that uses \`Meta LLaMa 3.1 70B\` to build \`IBM Granite 3 8B\`-powered apps using Streamlit -- a simple UI framework for Python.`
    };
  }
  set memory(memory) {
    this.input.memory = memory;
  }
  get memory() {
    return this.input.memory;
  }
  async _run(input, _options, run) {
    const { userMessage, runMemory } = await this.prepare(input);
    let content = "";
    const raw = await this.input.llm.create({
      stream: true,
      messages: runMemory.messages,
      abortSignal: run.signal
    }).observe((emitter) => {
      emitter.on("newToken", async ({ value: chunk }) => {
        const delta = chunk.getTextContent();
        if (delta) {
          content += delta;
          await run.emitter.emit("newToken", {
            delta,
            state: {
              content
            },
            chunk
          });
        }
      });
    });
    const result = this.parse(content || raw.getTextContent());
    const assistantMessage = new AssistantMessage(content);
    await this.memory.addMany([
      userMessage,
      assistantMessage
    ].filter(isTruthy));
    return {
      result,
      message: assistantMessage,
      memory: runMemory
    };
  }
  async prepare(input) {
    const systemMessage = new SystemMessage((this.input.templates?.system ?? StreamlitAgentSystemPrompt).render({}));
    const userMessage = input.prompt !== null || this.memory.isEmpty() ? new UserMessage(input.prompt ?? "No message.", {
      createdAt: /* @__PURE__ */ new Date()
    }) : null;
    const inputMessages = [
      ...this.memory.messages,
      userMessage
    ].filter(isTruthy);
    const runMemory = new TokenMemory({
      capacityThreshold: 0.85,
      syncThreshold: 0.6,
      handlers: {
        removalSelector(msgs) {
          const prevConversationMsg = msgs.find((msg) => inputMessages.includes(msg));
          if (prevConversationMsg && prevConversationMsg !== last(inputMessages)) {
            return prevConversationMsg;
          }
          const lastMsg = msgs.length > 3 && msgs.find((m) => m.role === Role.ASSISTANT);
          if (!lastMsg) {
            throw new AgentError("Cannot fit the current conversation into the context window!");
          }
          return lastMsg;
        }
      }
    });
    await runMemory.addMany([
      systemMessage,
      ...inputMessages
    ].filter(isTruthy));
    return {
      runMemory,
      userMessage
    };
  }
  parse(raw) {
    const blocks = [];
    for (let i = 0; i < raw.length; ) {
      const text = raw.substring(i);
      const code = findFirstPair(text, [
        "```python-app\n",
        "\n```"
      ], {
        allowOverlap: true
      });
      if (!code) {
        blocks.push({
          start: i,
          end: i + text.length,
          content: text,
          name: "text"
        });
        break;
      }
      if (code.start > 0) {
        blocks.push({
          name: "text",
          start: i,
          end: i + code.start,
          content: text.substring(0, code.start)
        });
      }
      blocks.push({
        name: "app",
        content: code.inner,
        start: i + code.start,
        end: i + code.end
      });
      i += code.end;
    }
    return {
      raw,
      blocks
    };
  }
  createSnapshot() {
    return {
      ...super.createSnapshot(),
      input: this.input
    };
  }
}

export { StreamlitAgent };
//# sourceMappingURL=agent.js.map
//# sourceMappingURL=agent.js.map