import { VercelChatModel } from '../../vercel/backend/chat.js';
import { GoogleVertexClient } from './client.js';
import { getEnv } from '../../../internals/env.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class GoogleVertexChatModel extends VercelChatModel {
  static {
    __name(this, "GoogleVertexChatModel");
  }
  constructor(modelId = getEnv("GOOGLE_VERTEX_CHAT_MODEL", "gemini-1.5-pro"), settings = {}, client) {
    const model = GoogleVertexClient.ensure(client).instance.languageModel(modelId, settings);
    super(model);
  }
}

export { GoogleVertexChatModel };
//# sourceMappingURL=chat.js.map
//# sourceMappingURL=chat.js.map