'use strict';

var chat_cjs = require('../../../backend/chat.cjs');
var client_cjs = require('./client.cjs');
var remeda = require('remeda');
var WatsonxAiMlVml_v1 = require('@ibm-cloud/watsonx-ai/dist/watsonx-ai-ml/vml_v1.js');
var utils_cjs = require('../../../serializer/utils.cjs');
var emitter_cjs = require('../../../emitter/emitter.cjs');
var message_cjs = require('../../../backend/message.cjs');
var schema_cjs = require('../../../internals/helpers/schema.cjs');
var env_cjs = require('../../../internals/env.cjs');
var errors_cjs = require('../../../errors.cjs');
var base_cjs = require('../../../tools/base.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var WatsonxAiMlVml_v1__default = /*#__PURE__*/_interopDefault(WatsonxAiMlVml_v1);

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const Type = WatsonxAiMlVml_v1__default.default.TextChatResponseFormat.Constants.Type;
class WatsonxChatModel extends chat_cjs.ChatModel {
  static {
    __name(this, "WatsonxChatModel");
  }
  modelId;
  client;
  emitter;
  toolChoiceSupport;
  get providerId() {
    return "watsonx";
  }
  constructor(modelId = env_cjs.getEnv("WATSONX_CHAT_MODEL", "ibm/granite-3-8b-instruct"), client) {
    super(), this.modelId = modelId, this.emitter = emitter_cjs.Emitter.root.child({
      namespace: [
        "backend",
        "watsonx",
        "chat"
      ],
      creator: this
    }), this.toolChoiceSupport = [
      "none",
      "single"
    ];
    this.client = client_cjs.WatsonxClient.ensure(client);
  }
  config(config) {
    super.config(config);
    for (const name of [
      "topK"
    ]) {
      if (this.parameters[name] !== void 0) {
        this.parameters[name] = void 0;
        throw new errors_cjs.NotImplementedError(`Setting "${name}" parameter is not supported for WatsonX Chat Models.`);
      }
    }
    return this;
  }
  async _create(input, run) {
    const { result } = await this.client.instance.textChat({
      ...await this.prepareInput(input),
      signal: run.signal
    });
    const { messages, finishReason, usage } = this.extractOutput(result.choices, result.usage);
    return new chat_cjs.ChatModelOutput(messages, usage, finishReason);
  }
  async *_createStream(input, run) {
    const stream = await this.client.instance.textChatStream({
      ...await this.prepareInput(input),
      signal: run.signal,
      returnObject: true
    });
    for await (const raw of stream) {
      if (run.signal.aborted) {
        stream.controller.abort(run.signal.aborted);
        break;
      }
      const { messages, finishReason, usage } = this.extractOutput(raw.data.choices.map(({ delta, ...choice }) => ({
        ...choice,
        message: delta
      })), raw.data.usage);
      yield new chat_cjs.ChatModelOutput(messages, usage, finishReason);
    }
  }
  extractOutput(choices, usage) {
    return {
      finishReason: remeda.findLast(choices, (choice) => Boolean(choice?.finish_reason))?.finish_reason,
      usage: usage ? {
        completionTokens: usage.completion_tokens ?? 0,
        promptTokens: usage.prompt_tokens ?? 0,
        totalTokens: usage.total_tokens ?? 0
      } : void 0,
      messages: choices.flatMap(({ message }) => {
        const messages = [];
        if (message?.content) {
          const msg = new message_cjs.AssistantMessage({
            type: "text",
            text: message.content
          });
          messages.push(msg);
        }
        if (message?.tool_calls) {
          const msg = new message_cjs.AssistantMessage(message.tool_calls.map((call) => ({
            type: "tool-call",
            toolCallId: call.id,
            toolName: call.function.name,
            args: schema_cjs.parseBrokenJson(call.function.arguments)
          })));
          messages.push(msg);
        }
        if (message?.refusal) {
          const msg = new message_cjs.AssistantMessage({
            type: "text",
            text: message.refusal
          });
          messages.push(msg);
        }
        return messages;
      }).filter(remeda.isTruthy)
    };
  }
  async prepareInput(overrides) {
    const input = {
      ...this.parameters,
      ...overrides
    };
    const tools = await Promise.all((input.tools ?? []).map(async (tool) => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: await tool.getInputJsonSchema()
      }
    })));
    const toolConfig = {
      toolChoice: void 0,
      toolChoiceOption: void 0
    };
    if (input.toolChoice) {
      if (input.toolChoice instanceof base_cjs.Tool) {
        toolConfig.toolChoice = {
          type: "function",
          function: {
            name: input.toolChoice.name
          }
        };
      } else if (this.toolChoiceSupport.includes(input.toolChoice)) {
        toolConfig.toolChoiceOption = input.toolChoice;
      }
    }
    return {
      modelId: this.modelId,
      messages: input.messages.flatMap((message) => {
        if (message instanceof message_cjs.ToolMessage) {
          return message.content.map((content) => ({
            role: "tool",
            content: JSON.stringify(content.result),
            tool_call_id: content.toolCallId
          }));
        } else if (message instanceof message_cjs.SystemMessage) {
          return message.content.map((content) => ({
            role: "system",
            content: content.text
          }));
        } else if (message instanceof message_cjs.AssistantMessage) {
          return message.content.map((content) => ({
            role: "assistant",
            ...content.type === "text" && {
              content: content.text
            },
            ...content.type === "tool-call" && {
              id: content.toolCallId,
              type: "function",
              function: {
                name: content.toolName,
                arguments: JSON.stringify(content.args)
              }
            }
          }));
        } else {
          return [
            message.toPlain()
          ];
        }
      }),
      spaceId: this.client.spaceId,
      projectId: this.client.projectId,
      tools: remeda.isEmpty(tools) ? void 0 : tools,
      responseFormat: void 0,
      ...input.responseFormat && {
        responseFormat: {
          type: Type.JSON_OBJECT
        }
      },
      topP: input.topP,
      frequencyPenalty: input.frequencyPenalty,
      temperature: input.temperature,
      n: input.n,
      maxTokens: input.maxTokens,
      presencePenalty: input.presencePenalty,
      stop: input.stopSequences,
      seed: input.seed,
      ...toolConfig
    };
  }
  createSnapshot() {
    return {
      ...super.createSnapshot(),
      modelId: this.modelId,
      parameters: utils_cjs.shallowCopy(this.parameters),
      client: this.client
    };
  }
  loadSnapshot(snapshot) {
    Object.assign(this, snapshot);
  }
}

exports.WatsonxChatModel = WatsonxChatModel;
//# sourceMappingURL=chat.cjs.map
//# sourceMappingURL=chat.cjs.map