import { FrameworkError } from '../errors.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class BackendError extends FrameworkError {
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

export { BackendError, ChatModelError, EmbeddingModelError };
//# sourceMappingURL=errors.js.map
//# sourceMappingURL=errors.js.map