'use strict';

var base_cjs = require('../base.cjs');
var message_cjs = require('../../backend/message.cjs');
var emitter_cjs = require('../../emitter/emitter.cjs');
var object_cjs = require('../../internals/helpers/object.cjs');
var R = require('remeda');
var runner_cjs = require('./runners/granite/runner.cjs');
var runner_cjs$1 = require('./runners/deep-think/runner.cjs');
var errors_cjs = require('../../errors.cjs');
var runner_cjs$2 = require('./runners/default/runner.cjs');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var R__namespace = /*#__PURE__*/_interopNamespace(R);

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class ReActAgent extends base_cjs.BaseAgent {
  static {
    __name(this, "ReActAgent");
  }
  input;
  emitter;
  runner;
  constructor(input) {
    super(), this.input = input, this.emitter = emitter_cjs.Emitter.root.child({
      namespace: [
        "agent",
        "react"
      ],
      creator: this
    });
    const duplicate = input.tools.find((a, i, arr) => arr.find((b, j) => i !== j && a.name.toUpperCase() === b.name.toUpperCase()));
    if (duplicate) {
      throw new errors_cjs.ValueError(`Agent's tools must all have different names. Conflicting tool: ${duplicate.name}.`);
    }
    const modelId = this.input.llm.modelId.toLowerCase();
    this.runner = [
      {
        tag: "granite",
        runner: runner_cjs.GraniteRunner
      },
      {
        tag: "deepseek-r1",
        runner: runner_cjs$1.DeepThinkRunner
      }
    ].find(({ tag }) => modelId.includes(tag))?.runner ?? runner_cjs$2.DefaultRunner;
  }
  static {
    this.register();
  }
  set memory(memory) {
    this.input.memory = memory;
  }
  get memory() {
    return this.input.memory;
  }
  get meta() {
    const tools = this.input.tools.slice();
    if (this.input.meta) {
      return {
        ...this.input.meta,
        tools
      };
    }
    return {
      name: "ReAct",
      tools,
      description: "The Bee framework demonstrates its ability to auto-correct and adapt in real-time, improving the overall reliability and resilience of the system.",
      ...tools.length > 0 && {
        extraDescription: [
          `Tools that I can use to accomplish given task.`,
          ...tools.map((tool) => `Tool '${tool.name}': ${tool.description}.`)
        ].join("\n")
      }
    };
  }
  async _run(input, options = {}, run) {
    const runner = new this.runner(this.input, {
      ...options,
      execution: this.input.execution ?? options?.execution ?? {
        maxRetriesPerStep: 3,
        totalMaxRetries: 20,
        maxIterations: 10
      }
    }, run);
    await runner.init(input);
    let finalMessage;
    while (!finalMessage) {
      const { state, meta, emitter, signal } = await runner.createIteration();
      if (state.tool_name && state.tool_input) {
        const { output, success } = await runner.tool({
          state,
          emitter,
          meta,
          signal
        });
        await runner.memory.add(new message_cjs.AssistantMessage(runner.templates.assistant.render({
          thought: [
            state.thought
          ].filter(R__namespace.isTruthy),
          toolName: [
            state.tool_name
          ].filter(R__namespace.isTruthy),
          toolInput: [
            state.tool_input
          ].filter(R__namespace.isTruthy).map((call) => JSON.stringify(call)),
          toolOutput: [
            output
          ],
          finalAnswer: [
            state.final_answer
          ].filter(R__namespace.isTruthy)
        }), {
          success
        }));
        object_cjs.assign(state, {
          tool_output: output
        });
        for (const key of [
          "partialUpdate",
          "update"
        ]) {
          await emitter.emit(key, {
            data: state,
            update: {
              key: "tool_output",
              value: output,
              parsedValue: output
            },
            meta: {
              success,
              ...meta
            },
            memory: runner.memory
          });
        }
      }
      if (state.final_answer) {
        finalMessage = new message_cjs.AssistantMessage(state.final_answer, {
          createdAt: /* @__PURE__ */ new Date()
        });
        await runner.memory.add(finalMessage);
        await emitter.emit("success", {
          data: finalMessage,
          iterations: runner.iterations,
          memory: runner.memory,
          meta
        });
      }
    }
    if (input.prompt !== null) {
      await this.input.memory.add(new message_cjs.UserMessage(input.prompt, {
        createdAt: run.createdAt
      }));
    }
    await this.input.memory.add(finalMessage);
    return {
      result: finalMessage,
      iterations: runner.iterations,
      memory: runner.memory
    };
  }
  createSnapshot() {
    return {
      ...super.createSnapshot(),
      input: this.input,
      emitter: this.emitter,
      runner: this.runner
    };
  }
}

exports.ReActAgent = ReActAgent;
//# sourceMappingURL=agent.cjs.map
//# sourceMappingURL=agent.cjs.map