'use strict';

var serializer_cjs = require('../serializer/serializer.cjs');
var utils_cjs = require('../serializer/utils.cjs');
var error_cjs = require('../serializer/error.cjs');
var decoratorCache_cjs = require('../cache/decoratorCache.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class Serializable {
  static {
    __name(this, "Serializable");
  }
  constructor() {
    Object.getPrototypeOf(this).constructor.register();
    decoratorCache_cjs.Cache.init(this);
  }
  static register(aliases) {
    serializer_cjs.Serializer.registerSerializable(this, void 0, aliases);
  }
  async clone() {
    const snapshot = await this.createSnapshot();
    const target = Object.create(this.constructor.prototype);
    await target.loadSnapshot(snapshot);
    return target;
  }
  async serialize() {
    const snapshot = await this.createSnapshot();
    return await serializer_cjs.Serializer.serialize({
      target: utils_cjs.extractClassName(this),
      snapshot
    });
  }
  async deserialize(value, options) {
    const { __root } = await serializer_cjs.Serializer.deserializeWithMeta(value, options?.extraClasses);
    if (!__root.target) {
      console.warn(`Serializable class must be serialized via "serialize" method and not via Serializer class. This may lead to incorrect deserialization.`);
      return __root;
    }
    const current = utils_cjs.extractClassName(this);
    if (current !== __root.target) {
      throw new error_cjs.SerializerError(`Snapshot has been created for class '${__root.target}' but you want to use it for class '${current}'.`);
    }
    return __root.snapshot;
  }
  static async fromSnapshot(state) {
    const target = Object.create(this.prototype);
    await target.loadSnapshot(state);
    decoratorCache_cjs.Cache.init(target);
    return target;
  }
  static async fromSerialized(serialized, options = {}) {
    const target = Object.create(this.prototype);
    const state = await target.deserialize(serialized, options);
    await target.loadSnapshot(state);
    decoratorCache_cjs.Cache.init(target);
    return target;
  }
}

exports.Serializable = Serializable;
//# sourceMappingURL=serializable.cjs.map
//# sourceMappingURL=serializable.cjs.map