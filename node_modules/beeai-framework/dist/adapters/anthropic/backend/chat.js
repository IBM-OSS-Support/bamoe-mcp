import { VercelChatModel } from '../../vercel/backend/chat.js';
import { AnthropicClient } from './client.js';
import { getEnv } from '../../../internals/env.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class AnthropicChatModel extends VercelChatModel {
  static {
    __name(this, "AnthropicChatModel");
  }
  constructor(modelId = getEnv("ANTHROPIC_CHAT_MODEL", "claude-3-5-sonnet-latest"), settings = {}, client) {
    const model = AnthropicClient.ensure(client).instance.languageModel(modelId, settings);
    super(model);
  }
  static {
    this.register();
  }
}

export { AnthropicChatModel };
//# sourceMappingURL=chat.js.map
//# sourceMappingURL=chat.js.map