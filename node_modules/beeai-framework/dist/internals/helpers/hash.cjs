'use strict';

var node_crypto = require('node:crypto');
var errors_cjs = require('../../errors.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function createHash(input, length = 4) {
  if (length > 32) {
    throw new errors_cjs.NotImplementedError("Max supported hash length is 32");
  }
  return node_crypto.createHash("sha256").update(input).digest("hex").slice(0, length * 2);
}
__name(createHash, "createHash");
function createRandomHash(length = 4) {
  return createHash(node_crypto.randomBytes(20).toString("base64"), length);
}
__name(createRandomHash, "createRandomHash");

exports.createHash = createHash;
exports.createRandomHash = createRandomHash;
//# sourceMappingURL=hash.cjs.map
//# sourceMappingURL=hash.cjs.map