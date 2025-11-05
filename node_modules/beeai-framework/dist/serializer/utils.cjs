'use strict';

var R = require('remeda');
var weakRef_cjs = require('../internals/helpers/weakRef.cjs');
var object_cjs = require('../internals/helpers/object.cjs');
var prototype_cjs = require('../internals/helpers/prototype.cjs');
var error_cjs = require('./error.cjs');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var R__namespace = /*#__PURE__*/_interopNamespace(R);

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const SerializerSelfRefIdentifier = "__self_ref";
const SerializerRefIdentifier = "__ref";
class ClassConstructorPlaceholder {
  static {
    __name(this, "ClassConstructorPlaceholder");
  }
}
class RefPlaceholder {
  static {
    __name(this, "RefPlaceholder");
  }
  node;
  factory;
  static EmptyPlaceholder = Symbol();
  partialResult;
  constructor(node, factory) {
    this.node = node;
    this.factory = factory;
    this.partialResult = RefPlaceholder.EmptyPlaceholder;
  }
  get value() {
    if (this.partialResult !== RefPlaceholder.EmptyPlaceholder) {
      return this.partialResult;
    }
    const { createEmpty, updateInstance } = this.factory;
    if (!createEmpty || !updateInstance) {
      throw new error_cjs.SerializerError("Circular dependency has been detected!");
    }
    this.partialResult = createEmpty();
    return this.partialResult;
  }
  async final() {
    const finalInstance = await this.factory.fromPlain(this.node.__value, this.factory.ref);
    if (this.partialResult === RefPlaceholder.EmptyPlaceholder) {
      return finalInstance;
    }
    await this.factory.updateInstance(this.partialResult, finalInstance);
    return this.partialResult;
  }
}
function isSerializerNode(data) {
  return R__namespace.isPlainObject(data) && object_cjs.hasProp(data, "__serializer");
}
__name(isSerializerNode, "isSerializerNode");
function isRootNode(data) {
  return R__namespace.isPlainObject(data) && object_cjs.hasProp(data, "__root") && object_cjs.hasProp(data, "__version");
}
__name(isRootNode, "isRootNode");
const extractClassName = /* @__PURE__ */ (() => {
  const registry = /* @__PURE__ */ new Map();
  const register = /* @__PURE__ */ __name((name, factory) => {
    if (!registry.has(name)) {
      registry.set(name, []);
    }
    const target = registry.get(name);
    let index = target.indexOf(factory);
    if (index === -1) {
      index = target.push(factory) - 1;
    }
    return [
      name,
      index
    ].filter(Boolean).join("");
  }, "register");
  return (value) => {
    if (R__namespace.isObjectType(value) && "constructor" in value) {
      const name = value.constructor.name;
      return register(name, value.constructor);
    }
    if (R__namespace.isFunction(value)) {
      const name = value.name || value.constructor?.name || Function.name;
      return register(name, value);
    }
    return extractClassName(primitiveToSerializableClass(value));
  };
})();
const ClassByValueType = {
  string: String,
  number: Number,
  bigint: BigInt,
  boolean: Boolean,
  symbol: Symbol,
  undefined: class Undefined {
    static {
      __name(this, "Undefined");
    }
  },
  null: class Null {
    static {
      __name(this, "Null");
    }
  },
  object: Object,
  function: Function
};
function primitiveToSerializableClass(value) {
  const type = value === null ? "null" : typeof value;
  return ClassByValueType[type];
}
__name(primitiveToSerializableClass, "primitiveToSerializableClass");
async function traverseObject(obj, handler, stopFn) {
  const seen = new weakRef_cjs.SafeWeakSet();
  const traverse = /* @__PURE__ */ __name(async (_obj, path = []) => {
    if (!R__namespace.isPlainObject(_obj) || seen.has(_obj)) {
      return;
    }
    seen.add(_obj);
    if (stopFn?.(_obj)) {
      return;
    }
    for (const [key, value] of Object.entries(_obj)) {
      await traverse(value, path.concat(key));
      await handler({
        key,
        value,
        path: path.concat(key)
      });
    }
  }, "traverse");
  return await traverse(obj, []);
}
__name(traverseObject, "traverseObject");
function isSerializationRequired(factory) {
  const primitive = [
    ClassByValueType.string,
    ClassByValueType.boolean
  ];
  return !primitive.includes(factory);
}
__name(isSerializationRequired, "isSerializationRequired");
function* traverseWithUpdate(_obj) {
  if (Array.isArray(_obj)) {
    for (const [idx, value] of _obj.entries()) {
      yield {
        value,
        update: /* @__PURE__ */ __name((newValue) => {
          _obj[idx] = newValue;
        }, "update")
      };
    }
  } else if (R__namespace.isPlainObject(_obj)) {
    for (const [key, value] of R__namespace.entries(_obj)) {
      yield {
        value,
        update: /* @__PURE__ */ __name((newValue) => {
          _obj[key] = newValue;
        }, "update")
      };
    }
  } else if (_obj instanceof Map) {
    for (const [key, value] of _obj.entries()) {
      yield {
        value,
        update: /* @__PURE__ */ __name((newValue) => {
          _obj.set(key, newValue);
        }, "update")
      };
    }
  } else if (_obj instanceof Set) {
    for (const value of _obj.values()) {
      yield {
        value,
        update: /* @__PURE__ */ __name((newValue) => {
          _obj.delete(value);
          _obj.add(newValue);
        }, "update")
      };
    }
  }
}
__name(traverseWithUpdate, "traverseWithUpdate");
function shallowCopy(value) {
  if (R__namespace.isPlainObject(value)) {
    return Object.assign({}, value);
  } else if (R__namespace.isArray(value)) {
    return value.slice();
  } else if (prototype_cjs.isDirectInstanceOf(value, Map)) {
    return new Map(value.entries());
  } else if (prototype_cjs.isDirectInstanceOf(value, Set)) {
    return new Set(value.values());
  } else if (prototype_cjs.isDirectInstanceOf(value, Date)) {
    return new Date(value);
  }
  return value;
}
__name(shallowCopy, "shallowCopy");
async function deepCopy(source) {
  if (R.isObjectType(source) && "clone" in source && R.isFunction(source.clone)) {
    return await source.clone();
  }
  const copy = shallowCopy(source);
  await traverseObject(source, async ({ value, path }) => {
    const result = await deepCopy(value);
    object_cjs.setProp(copy, path, result);
  });
  return copy;
}
__name(deepCopy, "deepCopy");
function toBoundedFunction(fn, binds) {
  Object.assign(fn, {
    [toBoundedFunction.symbol]: binds
  });
  return fn;
}
__name(toBoundedFunction, "toBoundedFunction");
toBoundedFunction.symbol = Symbol("bounded");
function getFunctionBinds(fn) {
  const target = object_cjs.getProp(fn, [
    toBoundedFunction.symbol
  ], []);
  return target;
}
__name(getFunctionBinds, "getFunctionBinds");

exports.ClassConstructorPlaceholder = ClassConstructorPlaceholder;
exports.RefPlaceholder = RefPlaceholder;
exports.SerializerRefIdentifier = SerializerRefIdentifier;
exports.SerializerSelfRefIdentifier = SerializerSelfRefIdentifier;
exports.deepCopy = deepCopy;
exports.extractClassName = extractClassName;
exports.getFunctionBinds = getFunctionBinds;
exports.isRootNode = isRootNode;
exports.isSerializationRequired = isSerializationRequired;
exports.isSerializerNode = isSerializerNode;
exports.primitiveToSerializableClass = primitiveToSerializableClass;
exports.shallowCopy = shallowCopy;
exports.toBoundedFunction = toBoundedFunction;
exports.traverseObject = traverseObject;
exports.traverseWithUpdate = traverseWithUpdate;
//# sourceMappingURL=utils.cjs.map
//# sourceMappingURL=utils.cjs.map