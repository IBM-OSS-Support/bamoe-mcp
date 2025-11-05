import { Emitter } from '../../../emitter/emitter.js';
import { NotImplementedError } from '../../../errors.js';
import { EmbeddingModel } from '../../../backend/embedding.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class DummyEmbeddingModel extends EmbeddingModel {
  static {
    __name(this, "DummyEmbeddingModel");
  }
  modelId;
  emitter;
  constructor(modelId = "dummy") {
    super(), this.modelId = modelId, this.emitter = Emitter.root.child({
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
    throw new NotImplementedError();
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

export { DummyEmbeddingModel };
//# sourceMappingURL=embedding.js.map
//# sourceMappingURL=embedding.js.map