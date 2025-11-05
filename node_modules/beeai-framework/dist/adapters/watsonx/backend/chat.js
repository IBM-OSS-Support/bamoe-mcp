import { ChatModel, ChatModelOutput } from '../../../backend/chat.js';
import { WatsonxClient } from './client.js';
import { findLast, isTruthy, isEmpty } from 'remeda';
import WatsonxAiMlVml_v1 from '@ibm-cloud/watsonx-ai/dist/watsonx-ai-ml/vml_v1.js';
import { shallowCopy } from '../../../serializer/utils.js';
import { Emitter } from '../../../emitter/emitter.js';
import { AssistantMessage, ToolMessage, SystemMessage } from '../../../backend/message.js';
import { parseBrokenJson } from '../../../internals/helpers/schema.js';
import { getEnv } from '../../../internals/env.js';
import { NotImplementedError } from '../../../errors.js';
import { Tool } from '../../../tools/base.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const Type = WatsonxAiMlVml_v1.TextChatResponseFormat.Constants.Type;
class WatsonxChatModel extends ChatModel {
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
  constructor(modelId = getEnv("WATSONX_CHAT_MODEL", "ibm/granite-3-8b-instruct"), client) {
    super(), this.modelId = modelId, this.emitter = Emitter.root.child({
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
    this.client = WatsonxClient.ensure(client);
  }
  config(config) {
    super.config(config);
    for (const name of [
      "topK"
    ]) {
      if (this.parameters[name] !== void 0) {
        this.parameters[name] = void 0;
        throw new NotImplementedError(`Setting "${name}" parameter is not supported for WatsonX Chat Models.`);
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
    return new ChatModelOutput(messages, usage, finishReason);
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
      yield new ChatModelOutput(messages, usage, finishReason);
    }
  }
  extractOutput(choices, usage) {
    return {
      finishReason: findLast(choices, (choice) => Boolean(choice?.finish_reason))?.finish_reason,
      usage: usage ? {
        completionTokens: usage.completion_tokens ?? 0,
        promptTokens: usage.prompt_tokens ?? 0,
        totalTokens: usage.total_tokens ?? 0
      } : void 0,
      messages: choices.flatMap(({ message }) => {
        const messages = [];
        if (message?.content) {
          const msg = new AssistantMessage({
            type: "text",
            text: message.content
          });
          messages.push(msg);
        }
        if (message?.tool_calls) {
          const msg = new AssistantMessage(message.tool_calls.map((call) => ({
            type: "tool-call",
            toolCallId: call.id,
            toolName: call.function.name,
            args: parseBrokenJson(call.function.arguments)
          })));
          messages.push(msg);
        }
        if (message?.refusal) {
          const msg = new AssistantMessage({
            type: "text",
            text: message.refusal
          });
          messages.push(msg);
        }
        return messages;
      }).filter(isTruthy)
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
      if (input.toolChoice instanceof Tool) {
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
        if (message instanceof ToolMessage) {
          return message.content.map((content) => ({
            role: "tool",
            content: JSON.stringify(content.result),
            tool_call_id: content.toolCallId
          }));
        } else if (message instanceof SystemMessage) {
          return message.content.map((content) => ({
            role: "system",
            content: content.text
          }));
        } else if (message instanceof AssistantMessage) {
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
      tools: isEmpty(tools) ? void 0 : tools,
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
      parameters: shallowCopy(this.parameters),
      client: this.client
    };
  }
  loadSnapshot(snapshot) {
    Object.assign(this, snapshot);
  }
}

export { WatsonxChatModel };
//# sourceMappingURL=chat.js.map
//# sourceMappingURL=chat.js.map