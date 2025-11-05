import { VercelEmbeddingModel } from '../../vercel/backend/embedding.js';
import { AzureOpenAIClient } from './client.js';
import { getEnv } from '../../../internals/env.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class AzureOpenAIEmbeddingModel extends VercelEmbeddingModel {
  static {
    __name(this, "AzureOpenAIEmbeddingModel");
  }
  constructor(modelId = getEnv("AZURE_OPENAI_EMBEDDING_MODEL", "text-embedding-3-small"), settings = {}, client) {
    const model = AzureOpenAIClient.ensure(client).instance.textEmbeddingModel(modelId, settings);
    super(model);
  }
}

export { AzureOpenAIEmbeddingModel };
//# sourceMappingURL=embedding.js.map
//# sourceMappingURL=embedding.js.map