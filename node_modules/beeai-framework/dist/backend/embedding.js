import { Serializable } from '../internals/serializable.js';
import { shallowCopy } from '../serializer/utils.js';
import { RunContext } from '../context.js';
import { pRetry } from '../internals/helpers/retry.js';
import { parseModel, loadModel } from './utils.js';
import { EmbeddingModelError } from './errors.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class EmbeddingModel extends Serializable {
  static {
    __name(this, "EmbeddingModel");
  }
  create(input) {
    input = shallowCopy(input);
    return RunContext.enter(this, {
      params: [
        input
      ],
      signal: input?.abortSignal
    }, async (run) => {
      try {
        await run.emitter.emit("start", {
          input
        });
        const result = await pRetry(() => this._create(input, run), {
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
        if (error instanceof EmbeddingModelError) {
          throw error;
        } else {
          throw new EmbeddingModelError(`The Embedding Model has encountered an error.`, [
            error
          ]);
        }
      } finally {
        await run.emitter.emit("finish", null);
      }
    });
  }
  static async fromName(name) {
    const { providerId, modelId = "" } = parseModel(name);
    const Target = await loadModel(providerId, "embedding");
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

export { EmbeddingModel };
//# sourceMappingURL=embedding.js.map
//# sourceMappingURL=embedding.js.map