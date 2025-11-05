import { VercelEmbeddingModel } from '../../vercel/backend/embedding.js';
import { getEnv } from '../../../internals/env.js';
import { AmazonBedrockClient } from './client.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class BedrockEmbeddingModel extends VercelEmbeddingModel {
  static {
    __name(this, "BedrockEmbeddingModel");
  }
  constructor(modelId = getEnv("AWS_EMBEDDING_MODEL", "amazon.titan-embed-text-v1"), settings = {}, client) {
    const model = AmazonBedrockClient.ensure(client).instance.embedding(modelId, settings);
    super(model);
  }
}

export { BedrockEmbeddingModel };
//# sourceMappingURL=embedding.js.map
//# sourceMappingURL=embedding.js.map