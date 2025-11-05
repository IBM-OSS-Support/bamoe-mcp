import { EmbeddingModel } from '../../../backend/embedding.js';
import { Emitter } from '../../../emitter/emitter.js';
import { signalRace } from '../../../internals/helpers/promise.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class LangChainEmbeddingModel extends EmbeddingModel {
  static {
    __name(this, "LangChainEmbeddingModel");
  }
  lcEmbedding;
  emitter;
  constructor(lcEmbedding) {
    super(), this.lcEmbedding = lcEmbedding;
    this.emitter = Emitter.root.child({
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
    const embeddings = await signalRace(() => this.lcEmbedding.embedDocuments(input.values), run.signal);
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

export { LangChainEmbeddingModel };
//# sourceMappingURL=embedding.js.map
//# sourceMappingURL=embedding.js.map