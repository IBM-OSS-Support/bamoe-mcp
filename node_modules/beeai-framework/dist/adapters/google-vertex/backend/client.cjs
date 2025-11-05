'use strict';

var env_cjs = require('../../../internals/env.cjs');
var googleVertex = require('@ai-sdk/google-vertex');
var client_cjs = require('../../../backend/client.cjs');
var utils_cjs = require('../../vercel/backend/utils.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class GoogleVertexClient extends client_cjs.BackendClient {
  static {
    __name(this, "GoogleVertexClient");
  }
  create() {
    return googleVertex.createVertex({
      ...this.settings,
      project: this.settings?.project || env_cjs.getEnv("GOOGLE_VERTEX_PROJECT"),
      baseURL: this.settings?.baseURL || env_cjs.getEnv("GOOGLE_VERTEX_ENDPOINT"),
      location: this.settings?.location || env_cjs.getEnv("GOOGLE_VERTEX_LOCATION"),
      fetch: utils_cjs.vercelFetcher(this.settings?.fetch)
    });
  }
}

exports.GoogleVertexClient = GoogleVertexClient;
//# sourceMappingURL=client.cjs.map
//# sourceMappingURL=client.cjs.map