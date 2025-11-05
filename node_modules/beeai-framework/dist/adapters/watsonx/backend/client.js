import { WatsonXAI } from '@ibm-cloud/watsonx-ai';
import { getEnv } from '../../../internals/env.js';
import { IamAuthenticator } from 'ibm-cloud-sdk-core';
import { BackendClient } from '../../../backend/client.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class WatsonxClient extends BackendClient {
  static {
    __name(this, "WatsonxClient");
  }
  constructor(settings) {
    const region = settings?.region || getEnv("WATSONX_REGION");
    const baseUrl = settings?.baseUrl || getEnv("WATSONX_BASE_URL") || `https://${region}.ml.cloud.ibm.com`;
    const projectId = settings?.projectId || getEnv("WATSONX_PROJECT_ID");
    const spaceId = projectId ? void 0 : settings?.spaceId || getEnv("WATSONX_SPACE_ID");
    const version = settings?.version || getEnv("WATSONX_VERSION") || "2024-05-31";
    super({
      ...settings,
      baseUrl,
      projectId,
      spaceId,
      version
    });
  }
  get spaceId() {
    return this.settings.spaceId;
  }
  get projectId() {
    return this.settings.projectId;
  }
  create() {
    return WatsonXAI.newInstance({
      version: this.settings.version,
      serviceUrl: this.settings.baseUrl,
      authenticator: this.settings?.authenticator || new IamAuthenticator({
        apikey: this.settings?.apiKey || getEnv("WATSONX_API_KEY", ""),
        url: "https://iam.cloud.ibm.com"
      })
    });
  }
}

export { WatsonxClient };
//# sourceMappingURL=client.js.map
//# sourceMappingURL=client.js.map