'use strict';

var embedding_cjs = require('../../vercel/backend/embedding.cjs');
var env_cjs = require('../../../internals/env.cjs');
var client_cjs = require('./client.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class AnthropicEmbeddingModel extends embedding_cjs.VercelEmbeddingModel {
  static {
    __name(this, "AnthropicEmbeddingModel");
  }
  constructor(modelId = env_cjs.getEnv("ANTHROPIC_EMBEDDING_MODEL", "voyage-3-large"), _settings = {}, client) {
    const model = client_cjs.AnthropicClient.ensure(client).instance.textEmbeddingModel(modelId);
    super(model);
  }
}

exports.AnthropicEmbeddingModel = AnthropicEmbeddingModel;
//# sourceMappingURL=embedding.cjs.map
//# sourceMappingURL=embedding.cjs.map