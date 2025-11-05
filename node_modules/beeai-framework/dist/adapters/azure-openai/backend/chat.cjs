'use strict';

var chat_cjs = require('../../vercel/backend/chat.cjs');
var client_cjs = require('./client.cjs');
var env_cjs = require('../../../internals/env.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class AzureOpenAIChatModel extends chat_cjs.VercelChatModel {
  static {
    __name(this, "AzureOpenAIChatModel");
  }
  constructor(modelId = env_cjs.getEnv("AZURE_OPENAI_CHAT_MODEL", "gpt-4o"), settings = {}, client) {
    const model = client_cjs.AzureOpenAIClient.ensure(client).instance.chat(modelId, settings);
    super(model);
  }
}

exports.AzureOpenAIChatModel = AzureOpenAIChatModel;
//# sourceMappingURL=chat.cjs.map
//# sourceMappingURL=chat.cjs.map