'use strict';

var embedding_cjs = require('../../vercel/backend/embedding.cjs');
var client_cjs = require('./client.cjs');
var env_cjs = require('../../../internals/env.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class AzureOpenAIEmbeddingModel extends embedding_cjs.VercelEmbeddingModel {
  static {
    __name(this, "AzureOpenAIEmbeddingModel");
  }
  constructor(modelId = env_cjs.getEnv("AZURE_OPENAI_EMBEDDING_MODEL", "text-embedding-3-small"), settings = {}, client) {
    const model = client_cjs.AzureOpenAIClient.ensure(client).instance.textEmbeddingModel(modelId, settings);
    super(model);
  }
}

exports.AzureOpenAIEmbeddingModel = AzureOpenAIEmbeddingModel;
//# sourceMappingURL=embedding.cjs.map
//# sourceMappingURL=embedding.cjs.map