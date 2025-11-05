import { getEnv } from '../../../internals/env.js';
import { createOllama } from 'ollama-ai-provider';
import { BackendClient } from '../../../backend/client.js';
import { vercelFetcher } from '../../vercel/backend/utils.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class OllamaClient extends BackendClient {
  static {
    __name(this, "OllamaClient");
  }
  create() {
    return createOllama({
      ...this.settings ?? {},
      baseURL: this.settings?.baseURL ?? getEnv("OLLAMA_BASE_URL"),
      fetch: vercelFetcher(this.settings?.fetch)
    });
  }
}

export { OllamaClient };
//# sourceMappingURL=client.js.map
//# sourceMappingURL=client.js.map