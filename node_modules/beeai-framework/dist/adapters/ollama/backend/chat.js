import { VercelChatModel } from '../../vercel/backend/chat.js';
import { OllamaClient } from './client.js';
import { getEnv } from '../../../internals/env.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class OllamaChatModel extends VercelChatModel {
  static {
    __name(this, "OllamaChatModel");
  }
  supportsToolStreaming = false;
  toolChoiceSupport = [
    "none",
    "auto"
  ];
  constructor(modelId = getEnv("OLLAMA_CHAT_MODEL", "llama3.1:8b"), settings = {}, client) {
    const model = OllamaClient.ensure(client).instance.chat(modelId, {
      ...settings,
      structuredOutputs: true
    });
    super(model);
  }
  static {
    this.register();
  }
}

export { OllamaChatModel };
//# sourceMappingURL=chat.js.map
//# sourceMappingURL=chat.js.map