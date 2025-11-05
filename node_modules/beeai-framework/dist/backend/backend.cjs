'use strict';

var serializable_cjs = require('../internals/serializable.cjs');
var chat_cjs = require('./chat.cjs');
var embedding_cjs = require('./embedding.cjs');
var promise_cjs = require('../internals/helpers/promise.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class Backend extends serializable_cjs.Serializable {
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
    return new Backend(await promise_cjs.asyncProperties({
      chat: chat_cjs.ChatModel.fromName(input.chat),
      embedding: embedding_cjs.EmbeddingModel.fromName(input.embedding || "dummy")
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

exports.Backend = Backend;
//# sourceMappingURL=backend.cjs.map
//# sourceMappingURL=backend.cjs.map