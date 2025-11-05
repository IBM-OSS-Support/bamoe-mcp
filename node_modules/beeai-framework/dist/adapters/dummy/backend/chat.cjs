'use strict';

var chat_cjs = require('../../../backend/chat.cjs');
var emitter_cjs = require('../../../emitter/emitter.cjs');
var errors_cjs = require('../../../errors.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class DummyChatModel extends chat_cjs.ChatModel {
  static {
    __name(this, "DummyChatModel");
  }
  modelId;
  parameters;
  emitter;
  constructor(modelId = "dummy", parameters = {}) {
    super(), this.modelId = modelId, this.parameters = parameters, this.emitter = emitter_cjs.Emitter.root.child({
      namespace: [
        "backend",
        "dummy",
        "chat"
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
  _createStream(_input, _run) {
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
  static {
    this.register();
  }
}

exports.DummyChatModel = DummyChatModel;
//# sourceMappingURL=chat.cjs.map
//# sourceMappingURL=chat.cjs.map