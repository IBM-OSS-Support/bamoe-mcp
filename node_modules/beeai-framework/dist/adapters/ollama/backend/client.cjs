'use strict';

var env_cjs = require('../../../internals/env.cjs');
var ollamaAiProvider = require('ollama-ai-provider');
var client_cjs = require('../../../backend/client.cjs');
var utils_cjs = require('../../vercel/backend/utils.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class OllamaClient extends client_cjs.BackendClient {
  static {
    __name(this, "OllamaClient");
  }
  create() {
    return ollamaAiProvider.createOllama({
      ...this.settings ?? {},
      baseURL: this.settings?.baseURL ?? env_cjs.getEnv("OLLAMA_BASE_URL"),
      fetch: utils_cjs.vercelFetcher(this.settings?.fetch)
    });
  }
}

exports.OllamaClient = OllamaClient;
//# sourceMappingURL=client.cjs.map
//# sourceMappingURL=client.cjs.map