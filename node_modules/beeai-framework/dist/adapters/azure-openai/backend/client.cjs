'use strict';

var azure = require('@ai-sdk/azure');
var env_cjs = require('../../../internals/env.cjs');
var client_cjs = require('../../../backend/client.cjs');
var utils_cjs = require('../../vercel/backend/utils.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class AzureOpenAIClient extends client_cjs.BackendClient {
  static {
    __name(this, "AzureOpenAIClient");
  }
  create() {
    return azure.createAzure({
      ...this.settings,
      apiKey: this.settings.apiKey || env_cjs.getEnv("AZURE_OPENAI_API_KEY"),
      baseURL: this.settings.baseURL || env_cjs.getEnv("AZURE_OPENAI_API_ENDPOINT"),
      resourceName: this.settings.resourceName || env_cjs.getEnv("AZURE_OPENAI_API_RESOURCE"),
      apiVersion: this.settings.apiVersion || env_cjs.getEnv("AZURE_OPENAI_API_VERSION"),
      fetch: utils_cjs.vercelFetcher(this.settings?.fetch)
    });
  }
}

exports.AzureOpenAIClient = AzureOpenAIClient;
//# sourceMappingURL=client.cjs.map
//# sourceMappingURL=client.cjs.map