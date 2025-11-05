import { Serializer } from '../serializer/serializer.js';
import { extractClassName } from '../serializer/utils.js';
import { SerializerError } from '../serializer/error.js';
import { Cache } from '../cache/decoratorCache.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class Serializable {
  static {
    __name(this, "Serializable");
  }
  constructor() {
    Object.getPrototypeOf(this).constructor.register();
    Cache.init(this);
  }
  static register(aliases) {
    Serializer.registerSerializable(this, void 0, aliases);
  }
  async clone() {
    const snapshot = await this.createSnapshot();
    const target = Object.create(this.constructor.prototype);
    await target.loadSnapshot(snapshot);
    return target;
  }
  async serialize() {
    const snapshot = await this.createSnapshot();
    return await Serializer.serialize({
      target: extractClassName(this),
      snapshot
    });
  }
  async deserialize(value, options) {
    const { __root } = await Serializer.deserializeWithMeta(value, options?.extraClasses);
    if (!__root.target) {
      console.warn(`Serializable class must be serialized via "serialize" method and not via Serializer class. This may lead to incorrect deserialization.`);
      return __root;
    }
    const current = extractClassName(this);
    if (current !== __root.target) {
      throw new SerializerError(`Snapshot has been created for class '${__root.target}' but you want to use it for class '${current}'.`);
    }
    return __root.snapshot;
  }
  static async fromSnapshot(state) {
    const target = Object.create(this.prototype);
    await target.loadSnapshot(state);
    Cache.init(target);
    return target;
  }
  static async fromSerialized(serialized, options = {}) {
    const target = Object.create(this.prototype);
    const state = await target.deserialize(serialized, options);
    await target.loadSnapshot(state);
    Cache.init(target);
    return target;
  }
}

export { Serializable };
//# sourceMappingURL=serializable.js.map
//# sourceMappingURL=serializable.js.map