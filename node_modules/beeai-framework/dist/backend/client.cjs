'use strict';

var serializable_cjs = require('../internals/serializable.cjs');
var utils_cjs = require('../serializer/utils.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class BackendClient extends serializable_cjs.Serializable {
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
      settings: utils_cjs.shallowCopy(this.settings)
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

exports.BackendClient = BackendClient;
//# sourceMappingURL=client.cjs.map
//# sourceMappingURL=client.cjs.map