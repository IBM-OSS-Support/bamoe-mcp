'use strict';

var errors_cjs = require('../errors.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class BackendError extends errors_cjs.FrameworkError {
  static {
    __name(this, "BackendError");
  }
}
class ChatModelError extends BackendError {
  static {
    __name(this, "ChatModelError");
  }
}
class EmbeddingModelError extends BackendError {
  static {
    __name(this, "EmbeddingModelError");
  }
}

exports.BackendError = BackendError;
exports.ChatModelError = ChatModelError;
exports.EmbeddingModelError = EmbeddingModelError;
//# sourceMappingURL=errors.cjs.map
//# sourceMappingURL=errors.cjs.map