'use strict';

var chat_cjs = require('../../vercel/backend/chat.cjs');
var client_cjs = require('./client.cjs');
var env_cjs = require('../../../internals/env.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class GroqChatModel extends chat_cjs.VercelChatModel {
  static {
    __name(this, "GroqChatModel");
  }
  constructor(modelId = env_cjs.getEnv("GROQ_CHAT_MODEL", "gemma2-9b-it"), settings = {}, client) {
    const model = client_cjs.GroqClient.ensure(client).instance.languageModel(modelId, settings);
    super(model);
  }
  static {
    this.register();
  }
}

exports.GroqChatModel = GroqChatModel;
//# sourceMappingURL=chat.cjs.map
//# sourceMappingURL=chat.cjs.map