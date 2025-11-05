'use strict';

var client_cjs = require('./client.cjs');
var chat_cjs = require('../../vercel/backend/chat.cjs');
var env_cjs = require('../../../internals/env.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class OpenAIChatModel extends chat_cjs.VercelChatModel {
  static {
    __name(this, "OpenAIChatModel");
  }
  constructor(modelId = env_cjs.getEnv("OPENAI_CHAT_MODEL", "gpt-4o"), settings = {}, client) {
    const model = client_cjs.OpenAIClient.ensure(client).instance.chat(modelId, settings);
    super(model);
  }
}

exports.OpenAIChatModel = OpenAIChatModel;
//# sourceMappingURL=chat.cjs.map
//# sourceMappingURL=chat.cjs.map