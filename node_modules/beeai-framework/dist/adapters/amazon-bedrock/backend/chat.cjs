'use strict';

var client_cjs = require('./client.cjs');
var chat_cjs = require('../../vercel/backend/chat.cjs');
var env_cjs = require('../../../internals/env.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class AmazonBedrockChatModel extends chat_cjs.VercelChatModel {
  static {
    __name(this, "AmazonBedrockChatModel");
  }
  constructor(modelId = env_cjs.getEnv("AWS_CHAT_MODEL", "meta.llama3-70b-instruct-v1:0"), settings = {}, client) {
    const model = client_cjs.AmazonBedrockClient.ensure(client).instance.languageModel(modelId, settings);
    super(model);
  }
}

exports.AmazonBedrockChatModel = AmazonBedrockChatModel;
//# sourceMappingURL=chat.cjs.map
//# sourceMappingURL=chat.cjs.map