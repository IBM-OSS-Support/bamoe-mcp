import { ChatModel, ChatModelOutput } from '../../../backend/chat.js';
import { Emitter } from '../../../emitter/emitter.js';
import { AssistantMessage } from '../../../backend/message.js';
import { ValueError } from '../../../errors.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class LangChainChatModel extends ChatModel {
  static {
    __name(this, "LangChainChatModel");
  }
  lcLLM;
  parameters;
  emitter;
  constructor(lcLLM, parameters = {}) {
    super(), this.lcLLM = lcLLM, this.parameters = parameters;
    this.emitter = Emitter.root.child({
      namespace: [
        "backend",
        "langchain",
        "chat"
      ],
      creator: this
    });
  }
  get modelId() {
    return this.lcLLM._modelType();
  }
  get providerId() {
    return "langchain";
  }
  async _create(input, run) {
    const preparedInput = this.prepareInput(input, run);
    const response = this.lcLLM.bindTools ? await this.lcLLM.bindTools(input.tools ?? []).invoke(preparedInput.messages, preparedInput.options) : await this.lcLLM.invoke(preparedInput.messages, preparedInput.options);
    return this.prepareOutput(response);
  }
  async *_createStream(input, run) {
    const preparedInput = this.prepareInput(input, run);
    const stream = this.lcLLM.bindTools ? await this.lcLLM.bindTools(input.tools ?? []).stream(preparedInput.messages, preparedInput.options) : await this.lcLLM.stream(preparedInput.messages, preparedInput.options);
    for await (const response of stream) {
      const chunk = this.prepareOutput(response);
      yield chunk;
    }
  }
  prepareInput(input, run) {
    const messages = input.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      type: msg.role
    }));
    const options = {
      runId: run.runId,
      stop: input.stopSequences,
      signal: run.signal,
      tool_choice: input.toolChoice
    };
    return {
      messages,
      options
    };
  }
  prepareOutput(output) {
    const messages = [];
    if (typeof output.content === "string") {
      messages.push(new AssistantMessage(output.content));
    } else {
      messages.push(new AssistantMessage(output.content.map((message) => {
        if (message.type === "text") {
          return {
            type: "text",
            text: message.text
          };
        } else if (message.type === "image_url") {
          return {
            type: "text",
            text: message.image_url.toString()
          };
        } else {
          throw new ValueError(`Unknown message type "${message.type}"`);
        }
      })));
    }
    const usage = {
      totalTokens: output.usage_metadata?.total_tokens ?? 0,
      promptTokens: output.usage_metadata?.input_tokens ?? 0,
      completionTokens: output.usage_metadata?.output_tokens ?? 0
    };
    const stop = output.response_metadata.stop_sequence || "stop";
    return new ChatModelOutput(messages, usage, stop);
  }
  async _createStructure(input, run) {
    const { messages, options } = this.prepareInput(input, run);
    const { raw, parsed } = await this.lcLLM.withStructuredOutput(input.schema, {
      method: "jsonSchema",
      strict: false,
      includeRaw: true
    }).invoke(messages, options);
    return {
      object: parsed,
      output: this.prepareOutput(raw)
    };
  }
  createSnapshot() {
    return {
      ...super.createSnapshot(),
      emitter: this.emitter,
      lcLLM: this.lcLLM
    };
  }
  loadSnapshot(snapshot) {
    Object.assign(this, snapshot);
  }
}

export { LangChainChatModel };
//# sourceMappingURL=chat.js.map
//# sourceMappingURL=chat.js.map