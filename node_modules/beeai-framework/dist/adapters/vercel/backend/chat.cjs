'use strict';

var chat_cjs = require('../../../backend/chat.cjs');
var ai = require('ai');
var emitter_cjs = require('../../../emitter/emitter.cjs');
var message_cjs = require('../../../backend/message.cjs');
var errors_cjs = require('../../../errors.cjs');
var remeda = require('remeda');
var errors_cjs$1 = require('../../../backend/errors.cjs');
var zod = require('zod');
var base_cjs = require('../../../tools/base.cjs');
var utils_cjs = require('./utils.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class VercelChatModel extends chat_cjs.ChatModel {
  static {
    __name(this, "VercelChatModel");
  }
  model;
  emitter;
  supportsToolStreaming;
  constructor(model) {
    super(), this.model = model, this.supportsToolStreaming = true;
    if (!this.modelId) {
      throw new errors_cjs.ValueError("No modelId has been provided!");
    }
    this.emitter = emitter_cjs.Emitter.root.child({
      namespace: [
        "backend",
        this.providerId,
        "chat"
      ],
      creator: this
    });
  }
  get modelId() {
    return this.model.modelId;
  }
  get providerId() {
    const provider = this.model.provider.split(".")[0].split("-")[0];
    return remeda.toCamelCase(provider);
  }
  async _create(input, run) {
    const responseFormat = input.responseFormat;
    if (responseFormat && (responseFormat instanceof zod.ZodSchema || responseFormat.schema)) {
      const { output } = await this._createStructure({
        ...input,
        schema: responseFormat
      }, run);
      return output;
    }
    const { finishReason, usage, response: { messages } } = await ai.generateText(await this.transformInput(input));
    return new chat_cjs.ChatModelOutput(this.transformMessages(messages), usage, finishReason);
  }
  async _createStructure({ schema, ...input }, run) {
    const response = await ai.generateObject({
      temperature: 0,
      ...await this.transformInput(input),
      abortSignal: run.signal,
      model: this.model,
      ...schema instanceof zod.ZodSchema ? {
        schema,
        output: (schema._input || schema) instanceof zod.ZodArray ? "array" : (schema._input || schema) instanceof zod.ZodEnum ? "enum" : "object"
      } : {
        schema: schema.schema ? ai.jsonSchema(schema.schema) : zod.z.any(),
        schemaName: schema.name,
        schemaDescription: schema.description
      }
    });
    return {
      object: response.object,
      output: new chat_cjs.ChatModelOutput([
        new message_cjs.AssistantMessage(JSON.stringify(response.object, null, 2))
      ], response.usage, response.finishReason)
    };
  }
  async *_createStream(input, run) {
    if (!this.supportsToolStreaming && !remeda.isEmpty(input.tools ?? [])) {
      const response2 = await this._create(input, run);
      yield response2;
      return;
    }
    const { fullStream, usage, finishReason, response } = ai.streamText({
      ...await this.transformInput(input),
      abortSignal: run.signal
    });
    let lastChunk = null;
    for await (const event of fullStream) {
      let message;
      switch (event.type) {
        case "text-delta":
          message = new message_cjs.AssistantMessage(event.textDelta);
          break;
        case "tool-call":
          message = new message_cjs.AssistantMessage({
            type: event.type,
            toolCallId: event.toolCallId,
            toolName: event.toolName,
            args: event.args
          });
          break;
        case "error":
          throw new errors_cjs$1.ChatModelError("Unhandled error", [
            event.error
          ]);
        case "step-finish":
        case "step-start":
          continue;
        case "tool-result":
          message = new message_cjs.ToolMessage({
            type: event.type,
            toolCallId: event.toolCallId,
            toolName: event.toolName,
            result: event.result
          });
          break;
        case "tool-call-streaming-start":
        case "tool-call-delta":
          continue;
        case "finish":
          continue;
        default:
          throw new Error(`Unhandled event "${event.type}"`);
      }
      lastChunk = new chat_cjs.ChatModelOutput([
        message
      ]);
      yield lastChunk;
    }
    if (!lastChunk) {
      throw new errors_cjs$1.ChatModelError("No chunks have been received!");
    }
    lastChunk.usage = await usage;
    lastChunk.finishReason = await finishReason;
    await response;
  }
  async transformInput(input) {
    const tools = await Promise.all((input.tools ?? []).map(async (tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: ai.jsonSchema(await tool.getInputJsonSchema())
    })));
    const messages = input.messages.map((msg) => {
      if (msg instanceof message_cjs.CustomMessage) {
        msg = utils_cjs.encodeCustomMessage(msg);
      }
      if (msg instanceof message_cjs.AssistantMessage) {
        return {
          role: "assistant",
          content: msg.content
        };
      } else if (msg instanceof message_cjs.ToolMessage) {
        return {
          role: "tool",
          content: msg.content
        };
      } else if (msg instanceof message_cjs.UserMessage) {
        return {
          role: "user",
          content: msg.content
        };
      } else if (msg instanceof message_cjs.SystemMessage) {
        return {
          role: "system",
          content: msg.content.map((part) => part.text).join("\n")
        };
      }
      return {
        role: msg.role,
        content: msg.content
      };
    });
    let toolChoice;
    if (input.toolChoice && input.toolChoice instanceof base_cjs.Tool) {
      if (this.toolChoiceSupport.includes("single")) {
        toolChoice = {
          type: "tool",
          toolName: input.toolChoice.name
        };
      } else {
        this.logger.warn(`The single tool choice is not supported.`);
      }
    } else if (input.toolChoice) {
      if (this.toolChoiceSupport.includes(input.toolChoice)) {
        toolChoice = input.toolChoice;
      } else {
        this.logger.warn(`The following tool choice value '${input.toolChoice}' is not supported.`);
      }
    }
    return {
      ...this.parameters,
      ...input,
      toolChoice,
      model: this.model,
      tools: remeda.mapToObj(tools, ({ name, ...tool }) => [
        name,
        tool
      ]),
      messages
    };
  }
  transformMessages(messages) {
    return messages.flatMap((msg) => {
      if (msg.role === "tool") {
        return new message_cjs.ToolMessage(msg.content, msg.providerOptions);
      }
      return new message_cjs.AssistantMessage(msg.content, msg.providerOptions);
    });
  }
  createSnapshot() {
    return {
      ...super.createSnapshot(),
      providerId: this.providerId,
      modelId: this.modelId,
      supportsToolStreaming: this.supportsToolStreaming
    };
  }
  async loadSnapshot({ providerId, modelId, ...snapshot }) {
    const instance = await chat_cjs.ChatModel.fromName(`${providerId}:${modelId}`);
    if (!(instance instanceof VercelChatModel)) {
      throw new Error("Incorrect deserialization!");
    }
    instance.destroy();
    Object.assign(this, {
      ...snapshot,
      model: instance.model
    });
  }
}

exports.VercelChatModel = VercelChatModel;
//# sourceMappingURL=chat.cjs.map
//# sourceMappingURL=chat.cjs.map