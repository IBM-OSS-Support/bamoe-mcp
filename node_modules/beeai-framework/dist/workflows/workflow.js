import { z } from 'zod';
import { Serializable } from '../internals/serializable.js';
import { Emitter } from '../emitter/emitter.js';
import { RunContext } from '../context.js';
import { toCamelCase, pick, omit } from 'remeda';
import { shallowCopy, deepCopy } from '../serializer/utils.js';
import { FrameworkError, ValueError } from '../errors.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class WorkflowError extends FrameworkError {
  static {
    __name(this, "WorkflowError");
  }
  constructor(message, extra) {
    super(message, extra?.errors, {
      context: extra?.run ?? {},
      isRetryable: false,
      isFatal: true
    });
  }
}
class Workflow extends Serializable {
  static {
    __name(this, "Workflow");
  }
  input;
  static START = "__start__";
  static SELF = "__self__";
  static PREV = "__prev__";
  static NEXT = "__next__";
  static END = "__end__";
  emitter;
  steps;
  startStep;
  constructor(input) {
    super(), this.input = input, this.steps = /* @__PURE__ */ new Map(), this.startStep = void 0;
    this.emitter = Emitter.root.child({
      namespace: [
        "workflow",
        toCamelCase(input?.name ?? "")
      ].filter(Boolean),
      creator: this
    });
  }
  getSteps() {
    return Array.from(this.steps.keys());
  }
  get name() {
    return this.input.name ?? "";
  }
  get schemas() {
    return pick(this.input, [
      "schema",
      "outputSchema"
    ]);
  }
  addStep(name, step) {
    return this._addStep(name, step);
  }
  addStrictStep(name, schema, step) {
    return this._addStep(name, schema, step);
  }
  _addStep(name, schemaOrStep, stepOrEmpty) {
    if (!name.trim()) {
      throw new ValueError(`Step name cannot be empty!`);
    }
    if (this.steps.has(name)) {
      throw new ValueError(`Step '${name}' already exists!`);
    }
    if (name === Workflow.END) {
      throw new ValueError(`The name '${name}' cannot be used!`);
    }
    const schema = schemaOrStep && stepOrEmpty ? schemaOrStep : this.input.schema;
    const stepOrFlow = stepOrEmpty || schemaOrStep;
    this.steps.set(name, {
      schema,
      handler: stepOrFlow instanceof Workflow ? stepOrFlow.asStep({}) : stepOrFlow
    });
    return this;
  }
  setStart(name) {
    this.startStep = name;
    return this;
  }
  run(state, options = {}) {
    return RunContext.enter(this, {
      signal: options?.signal,
      params: [
        state,
        options
      ]
    }, async (runContext) => {
      const run = {
        steps: [],
        state: this.input.schema.parse(state),
        result: void 0
      };
      const handlers = {
        steps: run.steps,
        signal: runContext.signal,
        abort: /* @__PURE__ */ __name((reason) => runContext.abort(reason), "abort")
      };
      let next = this.findStep(options?.start || this.startStep || this.getSteps()[0]).current ?? Workflow.END;
      while (next && next !== Workflow.END) {
        const name = next;
        const step = this.steps.get(next);
        if (!step) {
          throw new WorkflowError(`Step '${next}' was not found.`, {
            run
          });
        }
        await runContext.emitter.emit("start", {
          run,
          step: next
        });
        try {
          const state2 = await step.schema.parseAsync(run.state).catch(async (err) => {
            throw new WorkflowError(`Step '${next}' cannot be executed because the provided input doesn't adhere to the step's schema.`, {
              run: shallowCopy(run),
              errors: [
                err
              ]
            });
          }).then(deepCopy);
          const nextStepRaw = await step.handler(state2, handlers);
          if (nextStepRaw === Workflow.START) {
            next = run.steps.at(0)?.name;
          } else if (nextStepRaw === Workflow.PREV) {
            next = this.findStep(next).prev;
          } else if (nextStepRaw === Workflow.SELF) {
            next = this.findStep(next).current;
          } else if (!nextStepRaw || nextStepRaw === Workflow.NEXT) {
            next = this.findStep(next).next || Workflow.END;
          } else {
            next = nextStepRaw;
          }
          const stepResult = {
            name,
            state: state2,
            next
          };
          run.steps.push(stepResult);
          run.state = stepResult.state;
          await runContext.emitter.emit("success", {
            run: shallowCopy(run),
            state: stepResult.state,
            step: stepResult.name,
            next: stepResult.next
          });
        } catch (error) {
          await runContext.emitter.emit("error", {
            run: shallowCopy(run),
            step: next,
            error
          });
          throw error;
        }
      }
      run.result = await (this.input.outputSchema ?? this.input.schema).parseAsync(run.state).catch((err) => {
        throw new WorkflowError(`Workflow has ended but it's state does not adhere to the workflow's output schema.`, {
          run: shallowCopy(run),
          errors: [
            err
          ]
        });
      });
      return run;
    });
  }
  delStep(name) {
    if (this.startStep === name) {
      this.startStep = void 0;
    }
    this.steps.delete(name);
    return this;
  }
  asStep(overrides) {
    return async (state, ctx) => {
      const mappedInput = overrides?.input ? overrides.input(state) : state;
      const result = await this.run(mappedInput, {
        start: overrides?.start,
        signal: ctx.signal
      });
      const mappedOutput = overrides?.output ? overrides.output(result.state) : result.state;
      Object.assign(state, mappedOutput);
      return overrides.next;
    };
  }
  findStep(current) {
    const steps = this.getSteps();
    const index = steps.indexOf(current);
    return {
      prev: steps[index - 1],
      current: steps[index],
      next: steps[index + 1]
    };
  }
  createSnapshot() {
    return {
      input: omit(this.input, [
        "schema",
        "outputSchema"
      ]),
      emitter: this.emitter,
      startStep: this.startStep,
      steps: this.steps
    };
  }
  loadSnapshot(snapshot) {
    Object.assign(this, snapshot);
    this.input.schema ??= z.any();
    this.input.outputSchema ??= z.any();
  }
}

export { Workflow, WorkflowError };
//# sourceMappingURL=workflow.js.map
//# sourceMappingURL=workflow.js.map