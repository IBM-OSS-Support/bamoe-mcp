'use strict';

var embedding_cjs = require('../../vercel/backend/embedding.cjs');
var env_cjs = require('../../../internals/env.cjs');
var client_cjs = require('./client.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class BedrockEmbeddingModel extends embedding_cjs.VercelEmbeddingModel {
  static {
    __name(this, "BedrockEmbeddingModel");
  }
  constructor(modelId = env_cjs.getEnv("AWS_EMBEDDING_MODEL", "amazon.titan-embed-text-v1"), settings = {}, client) {
    const model = client_cjs.AmazonBedrockClient.ensure(client).instance.embedding(modelId, settings);
    super(model);
  }
}

exports.BedrockEmbeddingModel = BedrockEmbeddingModel;
//# sourceMappingURL=embedding.cjs.map
//# sourceMappingURL=embedding.cjs.map