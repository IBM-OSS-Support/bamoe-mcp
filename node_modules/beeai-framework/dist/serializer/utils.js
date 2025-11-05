import * as R from 'remeda';
import { isObjectType, isFunction } from 'remeda';
import { SafeWeakSet } from '../internals/helpers/weakRef.js';
import { hasProp, getProp, setProp } from '../internals/helpers/object.js';
import { isDirectInstanceOf } from '../internals/helpers/prototype.js';
import { SerializerError } from './error.js';

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
      throw new SerializerError("Circular dependency has been detected!");
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
  return R.isPlainObject(data) && hasProp(data, "__serializer");
}
__name(isSerializerNode, "isSerializerNode");
function isRootNode(data) {
  return R.isPlainObject(data) && hasProp(data, "__root") && hasProp(data, "__version");
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
    if (R.isObjectType(value) && "constructor" in value) {
      const name = value.constructor.name;
      return register(name, value.constructor);
    }
    if (R.isFunction(value)) {
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
  const seen = new SafeWeakSet();
  const traverse = /* @__PURE__ */ __name(async (_obj, path = []) => {
    if (!R.isPlainObject(_obj) || seen.has(_obj)) {
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
  } else if (R.isPlainObject(_obj)) {
    for (const [key, value] of R.entries(_obj)) {
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
  if (R.isPlainObject(value)) {
    return Object.assign({}, value);
  } else if (R.isArray(value)) {
    return value.slice();
  } else if (isDirectInstanceOf(value, Map)) {
    return new Map(value.entries());
  } else if (isDirectInstanceOf(value, Set)) {
    return new Set(value.values());
  } else if (isDirectInstanceOf(value, Date)) {
    return new Date(value);
  }
  return value;
}
__name(shallowCopy, "shallowCopy");
async function deepCopy(source) {
  if (isObjectType(source) && "clone" in source && isFunction(source.clone)) {
    return await source.clone();
  }
  const copy = shallowCopy(source);
  await traverseObject(source, async ({ value, path }) => {
    const result = await deepCopy(value);
    setProp(copy, path, result);
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
  const target = getProp(fn, [
    toBoundedFunction.symbol
  ], []);
  return target;
}
__name(getFunctionBinds, "getFunctionBinds");

export { ClassConstructorPlaceholder, RefPlaceholder, SerializerRefIdentifier, SerializerSelfRefIdentifier, deepCopy, extractClassName, getFunctionBinds, isRootNode, isSerializationRequired, isSerializerNode, primitiveToSerializableClass, shallowCopy, toBoundedFunction, traverseObject, traverseWithUpdate };
//# sourceMappingURL=utils.js.map
//# sourceMappingURL=utils.js.map