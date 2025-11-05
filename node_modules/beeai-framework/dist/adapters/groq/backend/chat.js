import { VercelChatModel } from '../../vercel/backend/chat.js';
import { GroqClient } from './client.js';
import { getEnv } from '../../../internals/env.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class GroqChatModel extends VercelChatModel {
  static {
    __name(this, "GroqChatModel");
  }
  constructor(modelId = getEnv("GROQ_CHAT_MODEL", "gemma2-9b-it"), settings = {}, client) {
    const model = GroqClient.ensure(client).instance.languageModel(modelId, settings);
    super(model);
  }
  static {
    this.register();
  }
}

export { GroqChatModel };
//# sourceMappingURL=chat.js.map
//# sourceMappingURL=chat.js.map