'use strict';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
async function* transformAsyncIterable(generator, transformer) {
  let next;
  while (!(next = await generator.next()).done) {
    yield transformer(next.value);
  }
  return next.value;
}
__name(transformAsyncIterable, "transformAsyncIterable");
function isAsyncIterable(value) {
  return Boolean(value && Symbol.asyncIterator in value);
}
__name(isAsyncIterable, "isAsyncIterable");

exports.isAsyncIterable = isAsyncIterable;
exports.transformAsyncIterable = transformAsyncIterable;
//# sourceMappingURL=stream.cjs.map
//# sourceMappingURL=stream.cjs.map