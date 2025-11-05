import { createAzure } from '@ai-sdk/azure';
import { getEnv } from '../../../internals/env.js';
import { BackendClient } from '../../../backend/client.js';
import { vercelFetcher } from '../../vercel/backend/utils.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class AzureOpenAIClient extends BackendClient {
  static {
    __name(this, "AzureOpenAIClient");
  }
  create() {
    return createAzure({
      ...this.settings,
      apiKey: this.settings.apiKey || getEnv("AZURE_OPENAI_API_KEY"),
      baseURL: this.settings.baseURL || getEnv("AZURE_OPENAI_API_ENDPOINT"),
      resourceName: this.settings.resourceName || getEnv("AZURE_OPENAI_API_RESOURCE"),
      apiVersion: this.settings.apiVersion || getEnv("AZURE_OPENAI_API_VERSION"),
      fetch: vercelFetcher(this.settings?.fetch)
    });
  }
}

export { AzureOpenAIClient };
//# sourceMappingURL=client.js.map
//# sourceMappingURL=client.js.map