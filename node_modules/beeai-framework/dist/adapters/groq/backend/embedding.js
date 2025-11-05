import { VercelEmbeddingModel } from '../../vercel/backend/embedding.js';
import { getEnv } from '../../../internals/env.js';
import { GroqClient } from './client.js';
import { ValueError } from '../../../errors.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class GroqEmbeddingModel extends VercelEmbeddingModel {
  static {
    __name(this, "GroqEmbeddingModel");
  }
  constructor(modelId = getEnv("GROQ_EMBEDDING_MODEL", ""), _settings = {}, client) {
    if (!modelId) {
      throw new ValueError("Missing modelId!");
    }
    const model = GroqClient.ensure(client).instance.textEmbeddingModel(modelId);
    super(model);
  }
}

export { GroqEmbeddingModel };
//# sourceMappingURL=embedding.js.map
//# sourceMappingURL=embedding.js.map