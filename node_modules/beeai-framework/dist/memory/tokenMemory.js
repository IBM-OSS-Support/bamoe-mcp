import { BaseMemory, MemoryFatalError } from './base.js';
import * as R from 'remeda';
import { sum, map } from 'remeda';
import { shallowCopy } from '../serializer/utils.js';
import { removeFromArray } from '../internals/helpers/array.js';
import { ensureRange } from '../internals/helpers/number.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const simpleEstimate = /* @__PURE__ */ __name((msg) => Math.ceil(msg.text.length / 4), "simpleEstimate");
const simpleTokenize = /* @__PURE__ */ __name(async (msgs) => sum(map(msgs, simpleEstimate)), "simpleTokenize");
class TokenMemory extends BaseMemory {
  static {
    __name(this, "TokenMemory");
  }
  messages = [];
  threshold;
  syncThreshold;
  maxTokens = null;
  tokensByMessage = /* @__PURE__ */ new WeakMap();
  handlers;
  constructor(config = {}) {
    super();
    this.maxTokens = config.maxTokens ?? null;
    this.threshold = config.capacityThreshold ?? 0.75;
    this.syncThreshold = config.syncThreshold ?? 0.25;
    this.handlers = {
      ...config?.handlers,
      estimate: config?.handlers?.estimate || ((msg) => Math.ceil((msg.role.length + msg.text.length) / 4)),
      tokenize: config?.handlers?.tokenize || simpleTokenize,
      removalSelector: config.handlers?.removalSelector || ((messages) => messages[0])
    };
    if (!R.clamp({
      min: 0,
      max: 1
    })(this.threshold)) {
      throw new TypeError('"capacityThreshold" must be a number in range (0, 1>');
    }
  }
  static {
    this.register();
  }
  get tokensUsed() {
    return sum(this.messages.map((msg) => this.tokensByMessage.get(msg).tokensCount));
  }
  get isDirty() {
    return this.messages.some((msg) => this.tokensByMessage.get(msg)?.dirty !== false);
  }
  async add(message, index) {
    if (this.maxTokens === null) {
      this.maxTokens = 128e3;
    }
    const meta = this.tokensByMessage.has(message) ? this.tokensByMessage.get(message) : {
      tokensCount: this.handlers.estimate(message),
      dirty: true
    };
    if (meta.tokensCount > this.maxTokens) {
      throw new MemoryFatalError(`Retrieved message (${meta.tokensCount} tokens) cannot fit inside current memory (${this.maxTokens} tokens)`);
    }
    while (this.tokensUsed > this.maxTokens - meta.tokensCount) {
      const messageToDelete = this.handlers.removalSelector(this.messages);
      const exists = await this.delete(messageToDelete);
      if (!messageToDelete || !exists) {
        throw new MemoryFatalError('The "removalSelector" handler must return a valid message!');
      }
    }
    this.tokensByMessage.set(message, meta);
    index = ensureRange(index ?? this.messages.length, {
      min: 0,
      max: this.messages.length
    });
    this.messages.splice(index, 0, message);
    if (this.isDirty && this.tokensUsed / this.maxTokens >= this.syncThreshold) {
      await this.sync();
    }
  }
  async delete(message) {
    return removeFromArray(this.messages, message);
  }
  async sync() {
    const messages = await Promise.all(this.messages.map(async (msg) => {
      const cache = this.tokensByMessage.get(msg);
      if (cache?.dirty !== false) {
        const tokensCount = await this.handlers.tokenize([
          msg
        ]);
        this.tokensByMessage.set(msg, {
          tokensCount,
          dirty: false
        });
      }
      return msg;
    }));
    this.messages.length = 0;
    await this.addMany(messages);
  }
  reset() {
    for (const msg of this.messages) {
      this.tokensByMessage.delete(msg);
    }
    this.messages.length = 0;
  }
  stats() {
    return {
      tokensUsed: this.tokensUsed,
      maxTokens: this.maxTokens,
      messagesCount: this.messages.length,
      isDirty: this.isDirty
    };
  }
  createSnapshot() {
    return {
      threshold: this.threshold,
      syncThreshold: this.syncThreshold,
      messages: shallowCopy(this.messages),
      handlers: shallowCopy(this.handlers),
      maxTokens: this.maxTokens,
      tokensByMessage: this.messages.map((message) => [
        message,
        this.tokensByMessage.get(message)
      ]).filter(([_, value]) => value !== void 0)
    };
  }
  loadSnapshot({ tokensByMessage, ...state }) {
    Object.assign(this, state, {
      tokensByMessage: new WeakMap(tokensByMessage)
    });
  }
}

export { TokenMemory };
//# sourceMappingURL=tokenMemory.js.map
//# sourceMappingURL=tokenMemory.js.map