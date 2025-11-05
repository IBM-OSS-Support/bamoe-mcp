import { EmbeddingModel } from '../../../backend/embedding.js';
import { embedMany } from 'ai';
import { Emitter } from '../../../emitter/emitter.js';
import { toCamelCase } from 'remeda';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class VercelEmbeddingModel extends EmbeddingModel {
  static {
    __name(this, "VercelEmbeddingModel");
  }
  model;
  emitter;
  constructor(model) {
    super(), this.model = model;
    this.emitter = Emitter.root.child({
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
    return toCamelCase(provider);
  }
  async _create(input, run) {
    return embedMany({
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

export { VercelEmbeddingModel };
//# sourceMappingURL=embedding.js.map
//# sourceMappingURL=embedding.js.map