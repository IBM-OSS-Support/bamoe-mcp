'use strict';

var embedding_cjs = require('../../../backend/embedding.cjs');
var ai = require('ai');
var emitter_cjs = require('../../../emitter/emitter.cjs');
var remeda = require('remeda');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class VercelEmbeddingModel extends embedding_cjs.EmbeddingModel {
  static {
    __name(this, "VercelEmbeddingModel");
  }
  model;
  emitter;
  constructor(model) {
    super(), this.model = model;
    this.emitter = emitter_cjs.Emitter.root.child({
      namespace: [
        "backend",
        this.providerId,
        "embedding"
      ],
      creator: this
    });
  }
  get modelId() {
    return this.model.modelId;
  }
  get providerId() {
    const provider = this.model.provider.split(".")[0].split("-")[0];
    return remeda.toCamelCase(provider);
  }
  async _create(input, run) {
    return ai.embedMany({
      model: this.model,
      values: input.values,
      abortSignal: run.signal
    });
  }
  createSnapshot() {
    return {
      ...super.createSnapshot(),
      providerId: this.providerId,
      modelId: this.model
    };
  }
  async loadSnapshot({ providerId, modelId, ...snapshot }) {
    const instance = await VercelEmbeddingModel.fromName(`${providerId}:${modelId}`);
    if (!(instance instanceof VercelEmbeddingModel)) {
      throw new Error("Incorrect deserialization!");
    }
    instance.destroy();
    Object.assign(this, {
      ...snapshot,
      model: instance.model
    });
  }
}

exports.VercelEmbeddingModel = VercelEmbeddingModel;
//# sourceMappingURL=embedding.cjs.map
//# sourceMappingURL=embedding.cjs.map