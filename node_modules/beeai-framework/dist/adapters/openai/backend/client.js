import { createOpenAI } from '@ai-sdk/openai';
import { parseEnv, getEnv } from '../../../internals/env.js';
import { z } from 'zod';
import { BackendClient } from '../../../backend/client.js';
import { vercelFetcher } from '../../vercel/backend/utils.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class OpenAIClient extends BackendClient {
  static {
    __name(this, "OpenAIClient");
  }
  create() {
    const extraHeaders = parseEnv("OPENAI_API_HEADERS", z.preprocess((value) => {
      return Object.fromEntries(String(value || "").split(",").filter((pair) => pair.includes("=")).map((pair) => pair.split("=")));
    }, z.record(z.string())));
    const baseURL = this.settings?.baseURL || getEnv("OPENAI_API_ENDPOINT");
    let compatibility = this.settings?.compatibility || getEnv("OPENAI_COMPATIBILITY_MODE");
    if (baseURL && !compatibility) {
      compatibility = "compatible";
    } else if (!baseURL && !compatibility) {
      compatibility = "strict";
    }
    return createOpenAI({
      ...this.settings,
      compatibility,
      apiKey: this.settings?.apiKey || getEnv("OPENAI_API_KEY"),
      baseURL,
      headers: {
        ...extraHeaders,
        ...this.settings?.headers
      },
      fetch: vercelFetcher(this.settings?.fetch)
    });
  }
}

export { OpenAIClient };
//# sourceMappingURL=client.js.map
//# sourceMappingURL=client.js.map