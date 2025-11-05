import { AmazonBedrockClient } from './client.js';
import { VercelChatModel } from '../../vercel/backend/chat.js';
import { getEnv } from '../../../internals/env.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class AmazonBedrockChatModel extends VercelChatModel {
  static {
    __name(this, "AmazonBedrockChatModel");
  }
  constructor(modelId = getEnv("AWS_CHAT_MODEL", "meta.llama3-70b-instruct-v1:0"), settings = {}, client) {
    const model = AmazonBedrockClient.ensure(client).instance.languageModel(modelId, settings);
    super(model);
  }
}

export { AmazonBedrockChatModel };
//# sourceMappingURL=chat.js.map
//# sourceMappingURL=chat.js.map