'use strict';

var embedding_cjs = require('../../../backend/embedding.cjs');
var emitter_cjs = require('../../../emitter/emitter.cjs');
var promise_cjs = require('../../../internals/helpers/promise.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class LangChainEmbeddingModel extends embedding_cjs.EmbeddingModel {
  static {
    __name(this, "LangChainEmbeddingModel");
  }
  lcEmbedding;
  emitter;
  constructor(lcEmbedding) {
    super(), this.lcEmbedding = lcEmbedding;
    this.emitter = emitter_cjs.Emitter.root.child({
      namespace: [
        "langchain",
        "backend",
        "embedding"
      ],
      creator: this
    });
  }
  get modelId() {
    return "langchain";
  }
  // TODO
  get providerId() {
    return "langchain";
  }
  async _create(input, run) {
    const embeddings = await promise_cjs.signalRace(() => this.lcEmbedding.embedDocuments(input.values), run.signal);
    return {
      values: input.values.slice(),
      embeddings,
      usage: {
        tokens: void 0
      }
    };
  }
  createSnapshot() {
    return {
      ...super.createSnapshot(),
      lcEmbedding: this.lcEmbedding
    };
  }
  loadSnapshot(snapshot) {
    Object.assign(this, snapshot);
  }
}

exports.LangChainEmbeddingModel = LangChainEmbeddingModel;
//# sourceMappingURL=embedding.cjs.map
//# sourceMappingURL=embedding.cjs.map