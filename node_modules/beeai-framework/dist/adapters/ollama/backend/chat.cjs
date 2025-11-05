'use strict';

var chat_cjs = require('../../vercel/backend/chat.cjs');
var client_cjs = require('./client.cjs');
var env_cjs = require('../../../internals/env.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class OllamaChatModel extends chat_cjs.VercelChatModel {
  static {
    __name(this, "OllamaChatModel");
  }
  supportsToolStreaming = false;
  toolChoiceSupport = [
    "none",
    "auto"
  ];
  constructor(modelId = env_cjs.getEnv("OLLAMA_CHAT_MODEL", "llama3.1:8b"), settings = {}, client) {
    const model = client_cjs.OllamaClient.ensure(client).instance.chat(modelId, {
      ...settings,
      structuredOutputs: true
    });
    super(model);
  }
  static {
    this.register();
  }
}

exports.OllamaChatModel = OllamaChatModel;
//# sourceMappingURL=chat.cjs.map
//# sourceMappingURL=chat.cjs.map