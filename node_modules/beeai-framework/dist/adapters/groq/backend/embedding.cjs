'use strict';

var embedding_cjs = require('../../vercel/backend/embedding.cjs');
var env_cjs = require('../../../internals/env.cjs');
var client_cjs = require('./client.cjs');
var errors_cjs = require('../../../errors.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class GroqEmbeddingModel extends embedding_cjs.VercelEmbeddingModel {
  static {
    __name(this, "GroqEmbeddingModel");
  }
  constructor(modelId = env_cjs.getEnv("GROQ_EMBEDDING_MODEL", ""), _settings = {}, client) {
    if (!modelId) {
      throw new errors_cjs.ValueError("Missing modelId!");
    }
    const model = client_cjs.GroqClient.ensure(client).instance.textEmbeddingModel(modelId);
    super(model);
  }
}

exports.GroqEmbeddingModel = GroqEmbeddingModel;
//# sourceMappingURL=embedding.cjs.map
//# sourceMappingURL=embedding.cjs.map