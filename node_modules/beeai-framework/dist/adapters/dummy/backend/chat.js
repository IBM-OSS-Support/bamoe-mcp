import { ChatModel } from '../../../backend/chat.js';
import { Emitter } from '../../../emitter/emitter.js';
import { NotImplementedError } from '../../../errors.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class DummyChatModel extends ChatModel {
  static {
    __name(this, "DummyChatModel");
  }
  modelId;
  parameters;
  emitter;
  constructor(modelId = "dummy", parameters = {}) {
    super(), this.modelId = modelId, this.parameters = parameters, this.emitter = Emitter.root.child({
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
    throw new NotImplementedError();
  }
  _createStream(_input, _run) {
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
  static {
    this.register();
  }
}

export { DummyChatModel };
//# sourceMappingURL=chat.js.map
//# sourceMappingURL=chat.js.map