import { VercelEmbeddingModel } from '../../vercel/backend/embedding.js';
import { getEnv } from '../../../internals/env.js';
import { AnthropicClient } from './client.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class AnthropicEmbeddingModel extends VercelEmbeddingModel {
  static {
    __name(this, "AnthropicEmbeddingModel");
  }
  constructor(modelId = getEnv("ANTHROPIC_EMBEDDING_MODEL", "voyage-3-large"), _settings = {}, client) {
    const model = AnthropicClient.ensure(client).instance.textEmbeddingModel(modelId);
    super(model);
  }
}

export { AnthropicEmbeddingModel };
//# sourceMappingURL=embedding.js.map
//# sourceMappingURL=embedding.js.map