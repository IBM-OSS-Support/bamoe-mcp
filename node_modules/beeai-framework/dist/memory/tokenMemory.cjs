'use strict';

var base_cjs = require('./base.cjs');
var R = require('remeda');
var utils_cjs = require('../serializer/utils.cjs');
var array_cjs = require('../internals/helpers/array.cjs');
var number_cjs = require('../internals/helpers/number.cjs');

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
const simpleEstimate = /* @__PURE__ */ __name((msg) => Math.ceil(msg.text.length / 4), "simpleEstimate");
const simpleTokenize = /* @__PURE__ */ __name(async (msgs) => R.sum(R.map(msgs, simpleEstimate)), "simpleTokenize");
class TokenMemory extends base_cjs.BaseMemory {
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
    if (!R__namespace.clamp({
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
    return R.sum(this.messages.map((msg) => this.tokensByMessage.get(msg).tokensCount));
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
      throw new base_cjs.MemoryFatalError(`Retrieved message (${meta.tokensCount} tokens) cannot fit inside current memory (${this.maxTokens} tokens)`);
    }
    while (this.tokensUsed > this.maxTokens - meta.tokensCount) {
      const messageToDelete = this.handlers.removalSelector(this.messages);
      const exists = await this.delete(messageToDelete);
      if (!messageToDelete || !exists) {
        throw new base_cjs.MemoryFatalError('The "removalSelector" handler must return a valid message!');
      }
    }
    this.tokensByMessage.set(message, meta);
    index = number_cjs.ensureRange(index ?? this.messages.length, {
      min: 0,
      max: this.messages.length
    });
    this.messages.splice(index, 0, message);
    if (this.isDirty && this.tokensUsed / this.maxTokens >= this.syncThreshold) {
      await this.sync();
    }
  }
  async delete(message) {
    return array_cjs.removeFromArray(this.messages, message);
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
      messages: utils_cjs.shallowCopy(this.messages),
      handlers: utils_cjs.shallowCopy(this.handlers),
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

exports.TokenMemory = TokenMemory;
//# sourceMappingURL=tokenMemory.cjs.map
//# sourceMappingURL=tokenMemory.cjs.map