'use strict';

var serializable_cjs = require('../internals/serializable.cjs');
var utils_cjs = require('../serializer/utils.cjs');
var context_cjs = require('../context.cjs');
var retry_cjs = require('../internals/helpers/retry.cjs');
var utils_cjs$1 = require('./utils.cjs');
var errors_cjs = require('./errors.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class EmbeddingModel extends serializable_cjs.Serializable {
  static {
    __name(this, "EmbeddingModel");
  }
  create(input) {
    input = utils_cjs.shallowCopy(input);
    return context_cjs.RunContext.enter(this, {
      params: [
        input
      ],
      signal: input?.abortSignal
    }, async (run) => {
      try {
        await run.emitter.emit("start", {
          input
        });
        const result = await retry_cjs.pRetry(() => this._create(input, run), {
          retries: input.maxRetries || 0,
          signal: run.signal
        });
        await run.emitter.emit("success", {
          value: result
        });
        return result;
      } catch (error) {
        await run.emitter.emit("error", {
          input,
          error
        });
        if (error instanceof errors_cjs.EmbeddingModelError) {
          throw error;
        } else {
          throw new errors_cjs.EmbeddingModelError(`The Embedding Model has encountered an error.`, [
            error
          ]);
        }
      } finally {
        await run.emitter.emit("finish", null);
      }
    });
  }
  static async fromName(name) {
    const { providerId, modelId = "" } = utils_cjs$1.parseModel(name);
    const Target = await utils_cjs$1.loadModel(providerId, "embedding");
    return new Target(modelId);
  }
  createSnapshot() {
    return {
      emitter: this.emitter
    };
  }
  destroy() {
    this.emitter.destroy();
  }
}

exports.EmbeddingModel = EmbeddingModel;
//# sourceMappingURL=embedding.cjs.map
//# sourceMappingURL=embedding.cjs.map