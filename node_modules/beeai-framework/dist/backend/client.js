import { Serializable } from '../internals/serializable.js';
import { shallowCopy } from '../serializer/utils.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class BackendClient extends Serializable {
  static {
    __name(this, "BackendClient");
  }
  instance;
  settings;
  constructor(settings) {
    super();
    this.settings = settings ?? {};
    this.instance = this.create();
  }
  createSnapshot() {
    return {
      settings: shallowCopy(this.settings)
    };
  }
  loadSnapshot(snapshot) {
    Object.assign(this, snapshot);
    Object.assign(this, {
      instance: this.create()
    });
  }
  static ensure(settings) {
    if (settings && settings instanceof this) {
      return settings;
    }
    return new this(settings);
  }
}

export { BackendClient };
//# sourceMappingURL=client.js.map
//# sourceMappingURL=client.js.map