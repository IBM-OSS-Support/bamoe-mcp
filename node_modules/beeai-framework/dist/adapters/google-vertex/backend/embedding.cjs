'use strict';

var client_cjs = require('./client.cjs');
var embedding_cjs = require('../../vercel/backend/embedding.cjs');
var env_cjs = require('../../../internals/env.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class GoogleVertexEmbeddingModel extends embedding_cjs.VercelEmbeddingModel {
  static {
    __name(this, "GoogleVertexEmbeddingModel");
  }
  constructor(modelId = env_cjs.getEnv("GOOGLE_VERTEX_EMBEDDING_MODEL", "text-embedding-004"), _settings = {}, client) {
    const model = client_cjs.GoogleVertexClient.ensure(client).instance.textEmbeddingModel(modelId);
    super(model);
  }
}

exports.GoogleVertexEmbeddingModel = GoogleVertexEmbeddingModel;
//# sourceMappingURL=embedding.cjs.map
//# sourceMappingURL=embedding.cjs.map