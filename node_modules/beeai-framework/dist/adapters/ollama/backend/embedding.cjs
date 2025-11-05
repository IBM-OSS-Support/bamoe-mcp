'use strict';

var client_cjs = require('./client.cjs');
var embedding_cjs = require('../../vercel/backend/embedding.cjs');
var env_cjs = require('../../../internals/env.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class OllamaEmbeddingModel extends embedding_cjs.VercelEmbeddingModel {
  static {
    __name(this, "OllamaEmbeddingModel");
  }
  constructor(modelId = env_cjs.getEnv("OLLAMA_EMBEDDING_MODEL", "nomic-embed-text"), settings = {}, client) {
    const model = client_cjs.OllamaClient.ensure(client).instance.embedding(modelId, settings);
    super(model);
  }
}

exports.OllamaEmbeddingModel = OllamaEmbeddingModel;
//# sourceMappingURL=embedding.cjs.map
//# sourceMappingURL=embedding.cjs.map