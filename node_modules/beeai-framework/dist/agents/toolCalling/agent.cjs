'use strict';

var base_cjs = require('../base.cjs');
var base_cjs$1 = require('../../tools/base.cjs');
var emitter_cjs = require('../../emitter/emitter.cjs');
var utils_cjs = require('../../serializer/utils.cjs');
var unconstrainedMemory_cjs = require('../../memory/unconstrainedMemory.cjs');
var message_cjs = require('../../backend/message.cjs');
var remeda = require('remeda');
var counter_cjs = require('../../internals/helpers/counter.cjs');
var object_cjs = require('../../internals/helpers/object.cjs');
var decoratorCache_cjs = require('../../cache/decoratorCache.cjs');
var template_cjs = require('../../template.cjs');
var prompts_cjs = require('./prompts.cjs');
var zod = require('zod');

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
class ToolCallingAgent extends base_cjs.BaseAgent {
  static {
    __name(this, "ToolCallingAgent");
  }
  input;
  emitter;
  constructor(input) {
    super(), this.input = input, this.emitter = emitter_cjs.Emitter.root.child({
      namespace: [
        "agent",
        "toolCalling"
      ],
      creator: this
    });
    this.input.saveIntermediateSteps = this.input.saveIntermediateSteps ?? true;
  }
  static {
    this.register();
  }
  async _run(input, options = {}, run) {
    const tempMessageKey = "tempMessage";
    const execution = {
      totalMaxRetries: 20,
      ...object_cjs.omitUndefined(this.input.execution ?? {}),
      ...object_cjs.omitUndefined(options.execution ?? {})
    };
    const state = {
      memory: new unconstrainedMemory_cjs.UnconstrainedMemory(),
      result: void 0,
      iteration: 0
    };
    await state.memory.add(new message_cjs.SystemMessage(this.templates.system.render({
      role: void 0,
      instructions: void 0
    })));
    await state.memory.addMany(this.memory.messages);
    if (input.prompt) {
      const userMessage = new message_cjs.UserMessage(this.templates.task.render({
        prompt: input.prompt,
        context: input.context,
        expectedOutput: remeda.isString(input.expectedOutput) ? input.expectedOutput : void 0
      }));
      await state.memory.add(userMessage);
    }
    const globalRetriesCounter = new counter_cjs.RetryCounter(execution.totalMaxRetries || 1, base_cjs.AgentError);
    const usePlainResponse = !input.expectedOutput || !(input.expectedOutput instanceof zod.ZodSchema);
    const finalAnswerToolSchema = usePlainResponse ? zod.z.object({
      response: zod.z.string().describe(String(input.expectedOutput ?? ""))
    }) : input.expectedOutput;
    const finalAnswerTool = new base_cjs$1.DynamicTool({
      name: "final_answer",
      description: "Sends the final answer to the user",
      inputSchema: finalAnswerToolSchema,
      handler: /* @__PURE__ */ __name(async (input2) => {
        const result = usePlainResponse ? input2.response : JSON.stringify(input2);
        state.result = new message_cjs.AssistantMessage(result);
        return new base_cjs$1.StringToolOutput("Message has been sent");
      }, "handler")
    });
    const tools = [
      ...this.input.tools,
      finalAnswerTool
    ];
    let forceFinalAnswer = false;
    while (!state.result) {
      state.iteration++;
      if (state.iteration > (execution.totalMaxRetries ?? Infinity)) {
        throw new base_cjs.AgentError(`Agent was not able to resolve the task in ${state.iteration} iterations.`);
      }
      await run.emitter.emit("start", {
        state
      });
      const response = await this.input.llm.create({
        messages: state.memory.messages.slice(),
        tools,
        toolChoice: forceFinalAnswer ? finalAnswerTool : tools.length > 1 ? "required" : tools[0],
        stream: false
      });
      await state.memory.addMany(response.messages);
      const toolCallMessages = response.getToolCalls();
      for (const toolCall of toolCallMessages) {
        try {
          const tool = tools.find((tool2) => tool2.name === toolCall.toolName);
          if (!tool) {
            throw new base_cjs.AgentError(`Tool ${toolCall.toolName} does not exist!`);
          }
          const toolInput = toolCall.args;
          const toolResponse = await tool.run(toolInput).context({
            state,
            toolCallMsg: toolCall
          });
          await state.memory.add(new message_cjs.ToolMessage({
            type: "tool-result",
            toolCallId: toolCall.toolCallId,
            toolName: toolCall.toolName,
            result: toolResponse.getTextContent(),
            isError: false
          }));
        } catch (e) {
          if (e instanceof base_cjs$1.ToolError) {
            globalRetriesCounter.use(e);
            await state.memory.add(new message_cjs.ToolMessage({
              type: "tool-result",
              toolCallId: toolCall.toolCallId,
              toolName: toolCall.toolName,
              result: e.explain(),
              isError: true
            }));
          } else {
            throw e;
          }
        }
      }
      const textMessages = response.getTextMessages();
      if (remeda.isEmpty(toolCallMessages) && remeda.isEmpty(textMessages)) {
        await state.memory.add(new message_cjs.AssistantMessage("\n", {
          [tempMessageKey]: true
        }));
      } else {
        await state.memory.deleteMany(state.memory.messages.filter((msg) => msg.meta[tempMessageKey]));
      }
      if (!remeda.isEmpty(textMessages) && remeda.isEmpty(toolCallMessages)) {
        forceFinalAnswer = true;
        tools.length = 0;
        tools.push(finalAnswerTool);
      }
      await run.emitter.emit("success", {
        state
      });
    }
    if (this.input.saveIntermediateSteps) {
      this.memory.reset();
      await this.memory.addMany(state.memory.messages.slice(1));
    } else {
      await this.memory.addMany(state.memory.messages.slice(-2));
    }
    return {
      memory: state.memory,
      result: state.result
    };
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
      name: "ToolCalling",
      tools,
      description: "ToolCallingAgent that uses tools to accomplish the task.",
      ...tools.length > 0 && {
        extraDescription: [
          `Tools that I can use to accomplish given task.`,
          ...tools.map((tool) => `Tool '${tool.name}': ${tool.description}.`)
        ].join("\n")
      }
    };
  }
  get templates() {
    const overrides = this.input.templates ?? {};
    const defaultTemplates = {
      system: prompts_cjs.ToolCallingAgentSystemPrompt,
      task: prompts_cjs.ToolCallingAgentTaskPrompt
    };
    return object_cjs.mapObj(defaultTemplates)((key, defaultTemplate) => {
      const override = overrides[key] ?? defaultTemplate;
      if (override instanceof template_cjs.PromptTemplate) {
        return override;
      }
      return override(defaultTemplate) ?? defaultTemplate;
    });
  }
  createSnapshot() {
    return {
      ...super.createSnapshot(),
      input: utils_cjs.shallowCopy(this.input),
      emitter: this.emitter
    };
  }
  set memory(memory) {
    this.input.memory = memory;
  }
  get memory() {
    return this.input.memory;
  }
}
_ts_decorate([
  decoratorCache_cjs.Cache({
    enumerable: false
  }),
  _ts_metadata("design:type", typeof ToolCallingAgentTemplates === "undefined" ? Object : ToolCallingAgentTemplates),
  _ts_metadata("design:paramtypes", [])
], ToolCallingAgent.prototype, "templates", null);

exports.ToolCallingAgent = ToolCallingAgent;
//# sourceMappingURL=agent.cjs.map
//# sourceMappingURL=agent.cjs.map