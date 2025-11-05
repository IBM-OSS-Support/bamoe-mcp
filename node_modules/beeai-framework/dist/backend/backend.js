import { Serializable } from '../internals/serializable.js';
import { ChatModel } from './chat.js';
import { EmbeddingModel } from './embedding.js';
import { asyncProperties } from '../internals/helpers/promise.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class Backend extends Serializable {
  static {
    __name(this, "Backend");
  }
  chat;
  embedding;
  constructor(models) {
    super();
    Object.assign(this, models);
  }
  static async fromName(input) {
    return new Backend(await asyncProperties({
      chat: ChatModel.fromName(input.chat),
      embedding: EmbeddingModel.fromName(input.embedding || "dummy")
    }));
  }
  static async fromProvider(provider) {
    return await this.fromName({
      chat: provider,
      embedding: provider
    });
  }
  createSnapshot() {
    return {
      chat: this.chat,
      embedding: this.embedding
    };
  }
  loadSnapshot(snapshot) {
    Object.assign(this, snapshot);
  }
}

export { Backend };
//# sourceMappingURL=backend.js.map
//# sourceMappingURL=backend.js.map