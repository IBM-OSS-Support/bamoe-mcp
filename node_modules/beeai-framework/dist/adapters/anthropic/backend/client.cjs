'use strict';

var anthropic = require('@ai-sdk/anthropic');
var client_cjs = require('../../../backend/client.cjs');
var env_cjs = require('../../../internals/env.cjs');
var zod = require('zod');
var utils_cjs = require('../../vercel/backend/utils.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class AnthropicClient extends client_cjs.BackendClient {
  static {
    __name(this, "AnthropicClient");
  }
  create() {
    const extraHeaders = env_cjs.parseEnv("ANTHROPIC_API_HEADERS", zod.z.preprocess((value) => {
      return Object.fromEntries(String(value || "").split(",").filter((pair) => pair.includes("=")).map((pair) => pair.split("=")));
    }, zod.z.record(zod.z.string())));
    return anthropic.createAnthropic({
      ...this.settings,
      baseURL: this.settings?.baseURL || env_cjs.getEnv("ANTHROPIC_API_BASE_URL"),
      apiKey: this.settings.apiKey || env_cjs.getEnv("ANTHROPIC_API_KEY"),
      headers: {
        ...extraHeaders,
        ...this.settings?.headers
      },
      fetch: utils_cjs.vercelFetcher(this.settings?.fetch)
    });
  }
}

exports.AnthropicClient = AnthropicClient;
//# sourceMappingURL=client.cjs.map
//# sourceMappingURL=client.cjs.map