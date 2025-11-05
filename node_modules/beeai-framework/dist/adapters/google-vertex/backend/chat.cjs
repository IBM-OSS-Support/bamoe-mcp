'use strict';

var chat_cjs = require('../../vercel/backend/chat.cjs');
var client_cjs = require('./client.cjs');
var env_cjs = require('../../../internals/env.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class GoogleVertexChatModel extends chat_cjs.VercelChatModel {
  static {
    __name(this, "GoogleVertexChatModel");
  }
  constructor(modelId = env_cjs.getEnv("GOOGLE_VERTEX_CHAT_MODEL", "gemini-1.5-pro"), settings = {}, client) {
    const model = client_cjs.GoogleVertexClient.ensure(client).instance.languageModel(modelId, settings);
    super(model);
  }
}

exports.GoogleVertexChatModel = GoogleVertexChatModel;
//# sourceMappingURL=chat.cjs.map
//# sourceMappingURL=chat.cjs.map