'use strict';

var serializable_cjs = require('../../../internals/serializable.cjs');
var counter_cjs = require('../../../internals/helpers/counter.cjs');
var base_cjs = require('../../base.cjs');
var utils_cjs = require('../../../serializer/utils.cjs');
var decoratorCache_cjs = require('../../../cache/decoratorCache.cjs');
var object_cjs = require('../../../internals/helpers/object.cjs');
var template_cjs = require('../../../template.cjs');

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
class BaseRunner extends serializable_cjs.Serializable {
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
    this.failedAttemptsCounter = new counter_cjs.RetryCounter(options?.execution?.totalMaxRetries, base_cjs.AgentError);
  }
  async createIteration() {
    const meta = {
      iteration: this.iterations.length + 1
    };
    const maxIterations = this.options?.execution?.maxIterations ?? Infinity;
    if (meta.iteration > maxIterations) {
      throw new base_cjs.AgentError(`Agent was not able to resolve the task in ${maxIterations} iterations.`, [], {
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
    return object_cjs.mapObj(this.defaultTemplates)((key, defaultTemplate) => {
      const override = overrides[key] ?? defaultTemplate;
      if (override instanceof template_cjs.PromptTemplate) {
        return override;
      }
      return override(defaultTemplate) ?? defaultTemplate;
    });
  }
  createSnapshot() {
    return {
      input: utils_cjs.shallowCopy(this.input),
      options: utils_cjs.shallowCopy(this.options),
      memory: this.memory,
      failedAttemptsCounter: this.failedAttemptsCounter
    };
  }
  loadSnapshot(snapshot) {
    Object.assign(this, snapshot);
  }
}
_ts_decorate([
  decoratorCache_cjs.Cache({
    enumerable: false
  }),
  _ts_metadata("design:type", typeof ReActAgentTemplates === "undefined" ? Object : ReActAgentTemplates),
  _ts_metadata("design:paramtypes", [])
], BaseRunner.prototype, "templates", null);

exports.BaseRunner = BaseRunner;
//# sourceMappingURL=base.cjs.map
//# sourceMappingURL=base.cjs.map