'use strict';

var openai = require('@ai-sdk/openai');
var env_cjs = require('../../../internals/env.cjs');
var zod = require('zod');
var client_cjs = require('../../../backend/client.cjs');
var utils_cjs = require('../../vercel/backend/utils.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class OpenAIClient extends client_cjs.BackendClient {
  static {
    __name(this, "OpenAIClient");
  }
  create() {
    const extraHeaders = env_cjs.parseEnv("OPENAI_API_HEADERS", zod.z.preprocess((value) => {
      return Object.fromEntries(String(value || "").split(",").filter((pair) => pair.includes("=")).map((pair) => pair.split("=")));
    }, zod.z.record(zod.z.string())));
    const baseURL = this.settings?.baseURL || env_cjs.getEnv("OPENAI_API_ENDPOINT");
    let compatibility = this.settings?.compatibility || env_cjs.getEnv("OPENAI_COMPATIBILITY_MODE");
    if (baseURL && !compatibility) {
      compatibility = "compatible";
    } else if (!baseURL && !compatibility) {
      compatibility = "strict";
    }
    return openai.createOpenAI({
      ...this.settings,
      compatibility,
      apiKey: this.settings?.apiKey || env_cjs.getEnv("OPENAI_API_KEY"),
      baseURL,
      headers: {
        ...extraHeaders,
        ...this.settings?.headers
      },
      fetch: utils_cjs.vercelFetcher(this.settings?.fetch)
    });
  }
}

exports.OpenAIClient = OpenAIClient;
//# sourceMappingURL=client.cjs.map
//# sourceMappingURL=client.cjs.map