import { OpenAIClient } from './client.js';
import { VercelEmbeddingModel } from '../../vercel/backend/embedding.js';
import { getEnv } from '../../../internals/env.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class OpenAIEmbeddingModel extends VercelEmbeddingModel {
  static {
    __name(this, "OpenAIEmbeddingModel");
  }
  constructor(modelId = getEnv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small"), settings = {}, client) {
    const model = OpenAIClient.ensure(client).instance.embedding(modelId, settings);
    super(model);
  }
}

export { OpenAIEmbeddingModel };
//# sourceMappingURL=embedding.js.map
//# sourceMappingURL=embedding.js.map