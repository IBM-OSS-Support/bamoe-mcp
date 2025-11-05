import { VercelChatModel } from '../../vercel/backend/chat.js';
import { AzureOpenAIClient } from './client.js';
import { getEnv } from '../../../internals/env.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class AzureOpenAIChatModel extends VercelChatModel {
  static {
    __name(this, "AzureOpenAIChatModel");
  }
  constructor(modelId = getEnv("AZURE_OPENAI_CHAT_MODEL", "gpt-4o"), settings = {}, client) {
    const model = AzureOpenAIClient.ensure(client).instance.chat(modelId, settings);
    super(model);
  }
}

export { AzureOpenAIChatModel };
//# sourceMappingURL=chat.js.map
//# sourceMappingURL=chat.js.map