import { Serializable } from '../../../internals/serializable.js';
import { RetryCounter } from '../../../internals/helpers/counter.js';
import { AgentError } from '../../base.js';
import { shallowCopy } from '../../../serializer/utils.js';
import { Cache } from '../../../cache/decoratorCache.js';
import { mapObj } from '../../../internals/helpers/object.js';
import { PromptTemplate } from '../../../template.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function _ts_decorate(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
__name(_ts_decorate, "_ts_decorate");
function _ts_metadata(k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
__name(_ts_metadata, "_ts_metadata");
class BaseRunner extends Serializable {
  static {
    __name(this, "BaseRunner");
  }
  input;
  options;
  run;
  memory;
  iterations;
  failedAttemptsCounter;
  constructor(input, options, run) {
    super(), this.input = input, this.options = options, this.run = run, this.iterations = [];
    this.failedAttemptsCounter = new RetryCounter(options?.execution?.totalMaxRetries, AgentError);
  }
  async createIteration() {
    const meta = {
      iteration: this.iterations.length + 1
    };
    const maxIterations = this.options?.execution?.maxIterations ?? Infinity;
    if (meta.iteration > maxIterations) {
      throw new AgentError(`Agent was not able to resolve the task in ${maxIterations} iterations.`, [], {
        isFatal: true,
        isRetryable: false,
        context: {
          iterations: this.iterations.map((iteration2) => iteration2.state)
        }
      });
    }
    const emitter = this.run.emitter.child({
      groupId: `iteration-${meta.iteration}`
    });
    const iteration = await this.llm({
      emitter,
      signal: this.run.signal,
      meta
    });
    this.iterations.push(iteration);
    return {
      emitter,
      state: iteration.state,
      meta,
      signal: this.run.signal
    };
  }
  async init(input) {
    this.memory = await this.initMemory(input);
  }
  get templates() {
    const overrides = this.input.templates ?? {};
    return mapObj(this.defaultTemplates)((key, defaultTemplate) => {
      const override = overrides[key] ?? defaultTemplate;
      if (override instanceof PromptTemplate) {
        return override;
      }
      return override(defaultTemplate) ?? defaultTemplate;
    });
  }
  createSnapshot() {
    return {
      input: shallowCopy(this.input),
      options: shallowCopy(this.options),
      memory: this.memory,
      failedAttemptsCounter: this.failedAttemptsCounter
    };
  }
  loadSnapshot(snapshot) {
    Object.assign(this, snapshot);
  }
}
_ts_decorate([
  Cache({
    enumerable: false
  }),
  _ts_metadata("design:type", typeof ReActAgentTemplates === "undefined" ? Object : ReActAgentTemplates),
  _ts_metadata("design:paramtypes", [])
], BaseRunner.prototype, "templates", null);

export { BaseRunner };
//# sourceMappingURL=base.js.map
//# sourceMappingURL=base.js.map