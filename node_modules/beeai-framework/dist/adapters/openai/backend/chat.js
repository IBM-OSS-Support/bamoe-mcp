import { OpenAIClient } from './client.js';
import { VercelChatModel } from '../../vercel/backend/chat.js';
import { getEnv } from '../../../internals/env.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class OpenAIChatModel extends VercelChatModel {
  static {
    __name(this, "OpenAIChatModel");
  }
  constructor(modelId = getEnv("OPENAI_CHAT_MODEL", "gpt-4o"), settings = {}, client) {
    const model = OpenAIClient.ensure(client).instance.chat(modelId, settings);
    super(model);
  }
}

export { OpenAIChatModel };
//# sourceMappingURL=chat.js.map
//# sourceMappingURL=chat.js.map