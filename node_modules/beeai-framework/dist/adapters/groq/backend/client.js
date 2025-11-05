import { createGroq } from '@ai-sdk/groq';
import { BackendClient } from '../../../backend/client.js';
import { getEnv } from '../../../internals/env.js';
import { vercelFetcher } from '../../vercel/backend/utils.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class GroqClient extends BackendClient {
  static {
    __name(this, "GroqClient");
  }
  create() {
    return createGroq({
      ...this.settings,
      baseURL: this.settings.baseURL || getEnv("GROQ_API_BASE_URL"),
      apiKey: this.settings.apiKey || getEnv("GROQ_API_KEY"),
      fetch: vercelFetcher(this.settings?.fetch)
    });
  }
}

export { GroqClient };
//# sourceMappingURL=client.js.map
//# sourceMappingURL=client.js.map