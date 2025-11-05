import { WatsonxClient } from './client.js';
import { EmbeddingModel } from '../../../backend/embedding.js';
import { Emitter } from '../../../emitter/emitter.js';
import { getEnv } from '../../../internals/env.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class WatsonxEmbeddingModel extends EmbeddingModel {
  static {
    __name(this, "WatsonxEmbeddingModel");
  }
  modelId;
  parameters;
  client;
  emitter;
  get providerId() {
    return "watsonx";
  }
  constructor(modelId = getEnv("WATSONX_EMBEDDING_MODEL", "ibm/granite-embedding-107m-multilingual"), parameters = {}, client) {
    super(), this.modelId = modelId, this.parameters = parameters;
    this.client = WatsonxClient.ensure(client);
    this.emitter = Emitter.root.child({
      namespace: [
        "backend",
        "watsonx",
        "embedding"
      ],
      creator: this
    });
  }
  async _create(input) {
    const response = await this.client.instance.embedText({
      modelId: this.modelId,
      spaceId: this.client.spaceId,
      projectId: this.client.projectId,
      inputs: input.values,
      parameters: {
        return_options: {
          input_text: true
        },
        ...this.parameters
      }
    });
    const embeddings = response.result.results.map((e) => e.embedding);
    const values = response.result.results.map((e, i) => e.input || input.values.at(i));
    return {
      embeddings,
      values,
      usage: {
        tokens: response.result.input_token_count
      }
    };
  }
  createSnapshot() {
    return {
      ...super.createSnapshot(),
      modelId: this.modelId,
      client: this.client
    };
  }
  loadSnapshot(snapshot) {
    Object.assign(this, snapshot);
  }
}

export { WatsonxEmbeddingModel };
//# sourceMappingURL=embedding.js.map
//# sourceMappingURL=embedding.js.map