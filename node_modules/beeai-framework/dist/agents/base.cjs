'use strict';

var errors_cjs = require('../errors.cjs');
var serializable_cjs = require('../internals/serializable.cjs');
var context_cjs = require('../context.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class AgentError extends errors_cjs.FrameworkError {
  static {
    __name(this, "AgentError");
  }
}
class BaseAgent extends serializable_cjs.Serializable {
  static {
    __name(this, "BaseAgent");
  }
  isRunning = false;
  run(...[input, options]) {
    if (this.isRunning) {
      throw new AgentError("Agent is already running!");
    }
    return context_cjs.RunContext.enter(this, {
      signal: options?.signal,
      params: [
        input,
        options
      ]
    }, async (context) => {
      try {
        this.isRunning = true;
        return await this._run(input, options, context);
      } catch (e) {
        if (e instanceof AgentError) {
          throw e;
        } else {
          throw new AgentError(`The Agent has encountered an error.`, [
            e
          ]);
        }
      } finally {
        this.isRunning = false;
      }
    });
  }
  destroy() {
    this.emitter.destroy();
  }
  get meta() {
    return {
      name: this.constructor.name ?? "BaseAgent",
      description: "",
      tools: []
    };
  }
  createSnapshot() {
    return {
      isRunning: false,
      emitter: this.emitter
    };
  }
  loadSnapshot(snapshot) {
    Object.assign(this, snapshot);
  }
}

exports.AgentError = AgentError;
exports.BaseAgent = BaseAgent;
//# sourceMappingURL=base.cjs.map
//# sourceMappingURL=base.cjs.map