var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
async function paginate(input) {
  const acc = [];
  let cursor = void 0;
  while (acc.length < input.size) {
    const { data, nextCursor } = await input.handler({
      cursor,
      limit: input.size - acc.length
    });
    acc.push(...data);
    if (nextCursor === void 0 || data.length === 0) {
      break;
    }
    cursor = nextCursor;
  }
  if (acc.length > input.size) {
    acc.length = input.size;
  }
  return acc;
}
__name(paginate, "paginate");

export { paginate };
//# sourceMappingURL=paginate.js.map
//# sourceMappingURL=paginate.js.map