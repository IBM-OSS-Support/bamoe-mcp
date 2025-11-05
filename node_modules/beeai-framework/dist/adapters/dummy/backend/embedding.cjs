'use strict';

var emitter_cjs = require('../../../emitter/emitter.cjs');
var errors_cjs = require('../../../errors.cjs');
var embedding_cjs = require('../../../backend/embedding.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class DummyEmbeddingModel extends embedding_cjs.EmbeddingModel {
  static {
    __name(this, "DummyEmbeddingModel");
  }
  modelId;
  emitter;
  constructor(modelId = "dummy") {
    super(), this.modelId = modelId, this.emitter = emitter_cjs.Emitter.root.child({
      namespace: [
        "backend",
        "dummy",
        "embedding"
      ],
      creator: this
    });
  }
  get providerId() {
    return "dummy";
  }
  _create(_input, _run) {
    throw new errors_cjs.NotImplementedError();
  }
  createSnapshot() {
    return {
      ...super.createSnapshot(),
      modelId: this.modelId
    };
  }
  loadSnapshot(snapshot) {
    Object.assign(this, snapshot);
  }
}

exports.DummyEmbeddingModel = DummyEmbeddingModel;
//# sourceMappingURL=embedding.cjs.map
//# sourceMappingURL=embedding.cjs.map