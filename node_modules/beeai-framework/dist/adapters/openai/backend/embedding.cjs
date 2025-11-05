'use strict';

var client_cjs = require('./client.cjs');
var embedding_cjs = require('../../vercel/backend/embedding.cjs');
var env_cjs = require('../../../internals/env.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class OpenAIEmbeddingModel extends embedding_cjs.VercelEmbeddingModel {
  static {
    __name(this, "OpenAIEmbeddingModel");
  }
  constructor(modelId = env_cjs.getEnv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small"), settings = {}, client) {
    const model = client_cjs.OpenAIClient.ensure(client).instance.embedding(modelId, settings);
    super(model);
  }
}

exports.OpenAIEmbeddingModel = OpenAIEmbeddingModel;
//# sourceMappingURL=embedding.cjs.map
//# sourceMappingURL=embedding.cjs.map