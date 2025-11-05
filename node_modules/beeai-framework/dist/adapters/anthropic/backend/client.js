import { createAnthropic } from '@ai-sdk/anthropic';
import { BackendClient } from '../../../backend/client.js';
import { parseEnv, getEnv } from '../../../internals/env.js';
import { z } from 'zod';
import { vercelFetcher } from '../../vercel/backend/utils.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class AnthropicClient extends BackendClient {
  static {
    __name(this, "AnthropicClient");
  }
  create() {
    const extraHeaders = parseEnv("ANTHROPIC_API_HEADERS", z.preprocess((value) => {
      return Object.fromEntries(String(value || "").split(",").filter((pair) => pair.includes("=")).map((pair) => pair.split("=")));
    }, z.record(z.string())));
    return createAnthropic({
      ...this.settings,
      baseURL: this.settings?.baseURL || getEnv("ANTHROPIC_API_BASE_URL"),
      apiKey: this.settings.apiKey || getEnv("ANTHROPIC_API_KEY"),
      headers: {
        ...extraHeaders,
        ...this.settings?.headers
      },
      fetch: vercelFetcher(this.settings?.fetch)
    });
  }
}

export { AnthropicClient };
//# sourceMappingURL=client.js.map
//# sourceMappingURL=client.js.map