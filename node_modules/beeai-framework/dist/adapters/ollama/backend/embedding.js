import { OllamaClient } from './client.js';
import { VercelEmbeddingModel } from '../../vercel/backend/embedding.js';
import { getEnv } from '../../../internals/env.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class OllamaEmbeddingModel extends VercelEmbeddingModel {
  static {
    __name(this, "OllamaEmbeddingModel");
  }
  constructor(modelId = getEnv("OLLAMA_EMBEDDING_MODEL", "nomic-embed-text"), settings = {}, client) {
    const model = OllamaClient.ensure(client).instance.embedding(modelId, settings);
    super(model);
  }
}

export { OllamaEmbeddingModel };
//# sourceMappingURL=embedding.js.map
//# sourceMappingURL=embedding.js.map