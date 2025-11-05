'use strict';

var watsonxAi = require('@ibm-cloud/watsonx-ai');
var env_cjs = require('../../../internals/env.cjs');
var ibmCloudSdkCore = require('ibm-cloud-sdk-core');
var client_cjs = require('../../../backend/client.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class WatsonxClient extends client_cjs.BackendClient {
  static {
    __name(this, "WatsonxClient");
  }
  constructor(settings) {
    const region = settings?.region || env_cjs.getEnv("WATSONX_REGION");
    const baseUrl = settings?.baseUrl || env_cjs.getEnv("WATSONX_BASE_URL") || `https://${region}.ml.cloud.ibm.com`;
    const projectId = settings?.projectId || env_cjs.getEnv("WATSONX_PROJECT_ID");
    const spaceId = projectId ? void 0 : settings?.spaceId || env_cjs.getEnv("WATSONX_SPACE_ID");
    const version = settings?.version || env_cjs.getEnv("WATSONX_VERSION") || "2024-05-31";
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
    return watsonxAi.WatsonXAI.newInstance({
      version: this.settings.version,
      serviceUrl: this.settings.baseUrl,
      authenticator: this.settings?.authenticator || new ibmCloudSdkCore.IamAuthenticator({
        apikey: this.settings?.apiKey || env_cjs.getEnv("WATSONX_API_KEY", ""),
        url: "https://iam.cloud.ibm.com"
      })
    });
  }
}

exports.WatsonxClient = WatsonxClient;
//# sourceMappingURL=client.cjs.map
//# sourceMappingURL=client.cjs.map