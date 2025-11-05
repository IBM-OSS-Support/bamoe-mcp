'use strict';

var array_cjs = require('../internals/helpers/array.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class Server {
  static {
    __name(this, "Server");
  }
  config;
  // @ts-expect-error
  static factories = /* @__PURE__ */ new Map();
  members;
  constructor(config) {
    this.config = config;
    this.members = [];
  }
  static registerFactory(ref, factory, override = false) {
    if (!this.factories.get(ref) || override) {
      this.factories.set(ref, factory);
    } else if (this.factories.get(ref) !== factory) {
      throw new Error(`Factory is already registered.`);
    }
  }
  register(input) {
    this.getFactory(input);
    if (!this.members.includes(input)) {
      this.members.push(input);
    }
    return this;
  }
  registerMany(input) {
    input.forEach((item) => this.register(item));
    return this;
  }
  deregister(input) {
    array_cjs.removeFromArray(this.members, input);
    return this;
  }
  getFactory(input) {
    const factory = this.constructor.factories.get(input);
    if (!factory) {
      throw new Error(`No factory registered for ${input.constructor.name}.`);
    }
    return factory;
  }
}

exports.Server = Server;
//# sourceMappingURL=server.cjs.map
//# sourceMappingURL=server.cjs.map