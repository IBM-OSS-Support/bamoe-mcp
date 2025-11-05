import { GoogleVertexClient } from './client.js';
import { VercelEmbeddingModel } from '../../vercel/backend/embedding.js';
import { getEnv } from '../../../internals/env.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class GoogleVertexEmbeddingModel extends VercelEmbeddingModel {
  static {
    __name(this, "GoogleVertexEmbeddingModel");
  }
  constructor(modelId = getEnv("GOOGLE_VERTEX_EMBEDDING_MODEL", "text-embedding-004"), _settings = {}, client) {
    const model = GoogleVertexClient.ensure(client).instance.textEmbeddingModel(modelId);
    super(model);
  }
}

export { GoogleVertexEmbeddingModel };
//# sourceMappingURL=embedding.js.map
//# sourceMappingURL=embedding.js.map