import { createHash as createHash$1, randomBytes } from 'node:crypto';
import { NotImplementedError } from '../../errors.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function createHash(input, length = 4) {
  if (length > 32) {
    throw new NotImplementedError("Max supported hash length is 32");
  }
  return createHash$1("sha256").update(input).digest("hex").slice(0, length * 2);
}
__name(createHash, "createHash");
function createRandomHash(length = 4) {
  return createHash(randomBytes(20).toString("base64"), length);
}
__name(createRandomHash, "createRandomHash");

export { createHash, createRandomHash };
//# sourceMappingURL=hash.js.map
//# sourceMappingURL=hash.js.map