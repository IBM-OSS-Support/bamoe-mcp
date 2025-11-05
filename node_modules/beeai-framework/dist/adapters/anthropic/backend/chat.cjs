'use strict';

var chat_cjs = require('../../vercel/backend/chat.cjs');
var client_cjs = require('./client.cjs');
var env_cjs = require('../../../internals/env.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class AnthropicChatModel extends chat_cjs.VercelChatModel {
  static {
    __name(this, "AnthropicChatModel");
  }
  constructor(modelId = env_cjs.getEnv("ANTHROPIC_CHAT_MODEL", "claude-3-5-sonnet-latest"), settings = {}, client) {
    const model = client_cjs.AnthropicClient.ensure(client).instance.languageModel(modelId, settings);
    super(model);
  }
  static {
    this.register();
  }
}

exports.AnthropicChatModel = AnthropicChatModel;
//# sourceMappingURL=chat.cjs.map
//# sourceMappingURL=chat.cjs.map