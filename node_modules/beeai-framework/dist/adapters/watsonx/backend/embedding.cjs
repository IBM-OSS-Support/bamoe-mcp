'use strict';

var client_cjs = require('./client.cjs');
var embedding_cjs = require('../../../backend/embedding.cjs');
var emitter_cjs = require('../../../emitter/emitter.cjs');
var env_cjs = require('../../../internals/env.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class WatsonxEmbeddingModel extends embedding_cjs.EmbeddingModel {
  static {
    __name(this, "WatsonxEmbeddingModel");
  }
  modelId;
  parameters;
  client;
  emitter;
  get providerId() {
    return "watsonx";
  }
  constructor(modelId = env_cjs.getEnv("WATSONX_EMBEDDING_MODEL", "ibm/granite-embedding-107m-multilingual"), parameters = {}, client) {
    super(), this.modelId = modelId, this.parameters = parameters;
    this.client = client_cjs.WatsonxClient.ensure(client);
    this.emitter = emitter_cjs.Emitter.root.child({
      namespace: [
        "backend",
        "watsonx",
        "embedding"
      ],
      creator: this
    });
  }
  async _create(input) {
    const response = await this.client.instance.embedText({
      modelId: this.modelId,
      spaceId: this.client.spaceId,
      projectId: this.client.projectId,
      inputs: input.values,
      parameters: {
        return_options: {
          input_text: true
        },
        ...this.parameters
      }
    });
    const embeddings = response.result.results.map((e) => e.embedding);
    const values = response.result.results.map((e, i) => e.input || input.values.at(i));
    return {
      embeddings,
      values,
      usage: {
        tokens: response.result.input_token_count
      }
    };
  }
  createSnapshot() {
    return {
      ...super.createSnapshot(),
      modelId: this.modelId,
      client: this.client
    };
  }
  loadSnapshot(snapshot) {
    Object.assign(this, snapshot);
  }
}

exports.WatsonxEmbeddingModel = WatsonxEmbeddingModel;
//# sourceMappingURL=embedding.cjs.map
//# sourceMappingURL=embedding.cjs.map