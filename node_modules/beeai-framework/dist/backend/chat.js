import { Serializable } from '../internals/serializable.js';
import { shallowCopy } from '../serializer/utils.js';
import { customMerge } from '../internals/helpers/object.js';
import { takeBigger } from '../internals/helpers/number.js';
import { RunContext } from '../context.js';
import { isEmpty, randomString, isFunction } from 'remeda';
import { ObjectHashKeyFn } from '../cache/decoratorCache.js';
import { Task } from 'promise-based-task';
import { NullCache } from '../cache/nullCache.js';
import { generateToolUnionSchema, filterToolsByToolChoice, parseModel, loadModel } from './utils.js';
import { Tool } from '../tools/base.js';
import { SystemMessage, AssistantMessage, UserMessage } from './message.js';
import { ChatModelError } from './errors.js';
import { z } from 'zod';
import { parseBrokenJson, toJsonSchema, createSchemaValidator } from '../internals/helpers/schema.js';
import { Retryable } from '../internals/helpers/retryable.js';
import { PromptTemplate } from '../template.js';
import { toAsyncGenerator } from '../internals/helpers/promise.js';
import { Serializer } from '../serializer/serializer.js';
import { Logger } from '../logger/logger.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class ChatModel extends Serializable {
  static {
    __name(this, "ChatModel");
  }
  cache = new NullCache();
  parameters = {};
  logger = Logger.root.child({
    name: this.constructor.name
  });
  toolChoiceSupport = [
    "required",
    "none",
    "single",
    "auto"
  ];
  toolCallFallbackViaResponseFormat = true;
  modelSupportsToolCalling = true;
  create(input) {
    input = shallowCopy(input);
    return RunContext.enter(this, {
      params: [
        input
      ],
      signal: input?.abortSignal
    }, async (run) => {
      if (!this.modelSupportsToolCalling) {
        input.tools = [];
      }
      const forceToolCallViaResponseFormat = this.shouldForceToolCallViaResponseFormat(input);
      if (forceToolCallViaResponseFormat && input.tools && !isEmpty(input.tools)) {
        input.responseFormat = await generateToolUnionSchema(filterToolsByToolChoice(input.tools, input.toolChoice));
        input.toolChoice = void 0;
      }
      if (!this.isToolChoiceSupported(input.toolChoice)) {
        this.logger.warn(`The following tool choice value '${input.toolChoice}' is not supported. Ignoring.`);
        input.toolChoice = void 0;
      }
      const cacheEntry = await this.createCacheAccessor(input);
      try {
        await run.emitter.emit("start", {
          input
        });
        const chunks = [];
        const generator = cacheEntry.value ?? (input.stream ? this._createStream(input, run) : toAsyncGenerator(this._create(input, run)));
        const controller = new AbortController();
        for await (const value of generator) {
          chunks.push(value);
          await run.emitter.emit("newToken", {
            value,
            callbacks: {
              abort: /* @__PURE__ */ __name(() => controller.abort(), "abort")
            }
          });
          if (controller.signal.aborted) {
            break;
          }
        }
        cacheEntry.resolve(chunks);
        const result = ChatModelOutput.fromChunks(chunks);
        if (forceToolCallViaResponseFormat && isEmpty(result.getToolCalls())) {
          const lastMsg = result.messages.at(-1);
          const toolCall = parseBrokenJson(lastMsg.text);
          if (!toolCall) {
            throw new ChatModelError(`Failed to produce a valid tool call. Generate output: ${lastMsg.text}`, [], {
              isFatal: true,
              isRetryable: false
            });
          }
          lastMsg.content.length = 0;
          lastMsg.content.push({
            type: "tool-call",
            toolCallId: `call_${randomString(8).toLowerCase()}`,
            toolName: toolCall.name,
            // todo: add types
            args: toolCall.parameters
          });
        }
        await run.emitter.emit("success", {
          value: result
        });
        return result;
      } catch (error) {
        await run.emitter.emit("error", {
          input,
          error
        });
        await cacheEntry.reject(error);
        if (error instanceof ChatModelError) {
          throw error;
        } else {
          throw new ChatModelError(`The Chat Model has encountered an error.`, [
            error
          ]);
        }
      } finally {
        await run.emitter.emit("finish", null);
      }
    });
  }
  createStructure(input) {
    return RunContext.enter(this, {
      params: [
        input
      ],
      signal: input?.abortSignal
    }, async (run) => {
      return await this._createStructure(input, run);
    });
  }
  config({ cache, parameters }) {
    if (cache) {
      this.cache = isFunction(cache) ? cache(this.cache) : cache;
    }
    if (parameters) {
      this.parameters = isFunction(parameters) ? parameters(this.parameters) : parameters;
    }
  }
  static async fromName(name, options) {
    const { providerId, modelId } = parseModel(name);
    const Target = await loadModel(providerId, "chat");
    return new Target(modelId || void 0, options);
  }
  async _createStructure(input, run) {
    const { schema, ...options } = input;
    const jsonSchema = toJsonSchema(schema);
    const systemTemplate = input.systemPromptTemplate ?? new PromptTemplate({
      schema: z.object({
        schema: z.string().min(1)
      }),
      template: `You are a helpful assistant that generates only valid JSON adhering to the following JSON Schema.

\`\`\`
{{schema}}
\`\`\`

IMPORTANT: You MUST answer with a JSON object that matches the JSON schema above.`
    });
    const messages = [
      new SystemMessage(systemTemplate.render({
        schema: JSON.stringify(jsonSchema, null, 2)
      })),
      ...input.messages
    ];
    const errorTemplate = new PromptTemplate({
      schema: z.object({
        errors: z.string(),
        expected: z.string(),
        received: z.string()
      }),
      template: `Generated object does not match the expected JSON schema!

Validation Errors: {{errors}}`
    });
    return new Retryable({
      executor: /* @__PURE__ */ __name(async () => {
        const response = await this._create({
          ...options,
          messages,
          responseFormat: {
            type: "object-json"
          }
        }, run);
        const textResponse = response.getTextContent();
        const object = parseBrokenJson(textResponse, {
          pair: [
            "{",
            "}"
          ]
        });
        const validator = createSchemaValidator(schema);
        const success = validator(object);
        if (!success) {
          const context = {
            expected: JSON.stringify(jsonSchema),
            received: textResponse,
            errors: JSON.stringify(validator.errors ?? [])
          };
          messages.push(new UserMessage(errorTemplate.render(context)));
          throw new ChatModelError(`LLM did not produce a valid output.`, [], {
            context
          });
        }
        return {
          object,
          output: response
        };
      }, "executor"),
      config: {
        signal: run.signal,
        maxRetries: input?.maxRetries || 1
      }
    }).get();
  }
  createSnapshot() {
    return {
      cache: this.cache,
      emitter: this.emitter,
      parameters: shallowCopy(this.parameters),
      logger: this.logger,
      toolChoiceSupport: this.toolChoiceSupport.slice(),
      toolCallFallbackViaResponseFormat: this.toolCallFallbackViaResponseFormat,
      modelSupportsToolCalling: this.modelSupportsToolCalling
    };
  }
  destroy() {
    this.emitter.destroy();
  }
  async createCacheAccessor({ abortSignal: _, messages, tools = [], ...input }) {
    const key = ObjectHashKeyFn({
      ...input,
      messages: await Serializer.serialize(messages.map((msg) => msg.toPlain())),
      tools: await Serializer.serialize(tools)
    });
    const value = await this.cache.get(key);
    const isNew = value === void 0;
    let task = null;
    if (isNew) {
      task = new Task();
      await this.cache.set(key, task);
    }
    return {
      key,
      value,
      resolve: /* @__PURE__ */ __name((value2) => {
        task?.resolve?.(value2);
      }, "resolve"),
      reject: /* @__PURE__ */ __name(async (error) => {
        task?.reject?.(error);
        if (isNew) {
          await this.cache.delete(key);
        }
      }, "reject")
    };
  }
  shouldForceToolCallViaResponseFormat({ tools = [], toolChoice, responseFormat }) {
    if (isEmpty(tools) || !toolChoice || toolChoice === "none" || toolChoice === "auto" || !this.toolCallFallbackViaResponseFormat || Boolean(responseFormat)) {
      return false;
    }
    const toolChoiceSupported = this.isToolChoiceSupported(toolChoice);
    return !this.modelSupportsToolCalling || !toolChoiceSupported;
  }
  isToolChoiceSupported(choice) {
    return !choice || (choice instanceof Tool ? this.toolChoiceSupport.includes("single") : this.toolChoiceSupport.includes(choice));
  }
}
class ChatModelOutput extends Serializable {
  static {
    __name(this, "ChatModelOutput");
  }
  messages;
  usage;
  finishReason;
  constructor(messages, usage, finishReason) {
    super(), this.messages = messages, this.usage = usage, this.finishReason = finishReason;
  }
  static fromChunks(chunks) {
    const final = new ChatModelOutput([]);
    chunks.forEach((cur) => final.merge(cur));
    return final;
  }
  merge(other) {
    this.messages.push(...other.messages);
    this.finishReason = other.finishReason;
    if (this.usage && other.usage) {
      this.usage = customMerge([
        this.usage,
        other.usage
      ], {
        totalTokens: takeBigger,
        promptTokens: takeBigger,
        completionTokens: takeBigger
      });
    } else if (other.usage) {
      this.usage = shallowCopy(other.usage);
    }
  }
  getToolCalls() {
    return this.messages.filter((r) => r instanceof AssistantMessage).flatMap((r) => r.getToolCalls()).filter(Boolean);
  }
  getTextMessages() {
    return this.messages.filter((r) => r instanceof AssistantMessage).filter((r) => r.text);
  }
  getTextContent() {
    return this.messages.filter((r) => r instanceof AssistantMessage).flatMap((r) => r.text).filter(Boolean).join("");
  }
  toString() {
    return this.getTextContent();
  }
  createSnapshot() {
    return {
      messages: shallowCopy(this.messages),
      usage: shallowCopy(this.usage),
      finishReason: this.finishReason
    };
  }
  loadSnapshot(snapshot) {
    Object.assign(this, snapshot);
  }
}

export { ChatModel, ChatModelOutput };
//# sourceMappingURL=chat.js.map
//# sourceMappingURL=chat.js.map