'use strict';

var serializable_cjs = require('../internals/serializable.cjs');
var utils_cjs = require('../serializer/utils.cjs');
var zod = require('zod');
var errors_cjs = require('../errors.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function isText(content) {
  return content.type === "text";
}
__name(isText, "isText");
function isImage(content) {
  return content.type === "image";
}
__name(isImage, "isImage");
function isFile(content) {
  return content.type === "file";
}
__name(isFile, "isFile");
function isToolCall(content) {
  return content.type === "tool-call";
}
__name(isToolCall, "isToolCall");
function isToolResult(content) {
  return content.type === "tool-result";
}
__name(isToolResult, "isToolResult");
class Message extends serializable_cjs.Serializable {
  static {
    __name(this, "Message");
  }
  meta;
  content;
  constructor(content, meta = {}) {
    super(), this.meta = meta;
    if (!meta?.createdAt) {
      meta.createdAt = /* @__PURE__ */ new Date();
    }
    if (typeof content === "string") {
      this.content = [
        this.fromString(content)
      ];
    } else {
      this.content = Array.isArray(content) ? content : [
        content
      ];
    }
  }
  static of({ role, text, meta }) {
    if (role === "user") {
      return new UserMessage(text, meta);
    } else if (role === "assistant") {
      return new AssistantMessage(text, meta);
    } else if (role === "system") {
      return new SystemMessage(text, meta);
    } else if (role === "tool") {
      return new ToolMessage(text, meta);
    } else {
      return new CustomMessage(role, text, meta);
    }
  }
  get text() {
    return this.getTexts().map((c) => c.text).join("");
  }
  getTexts() {
    return this.content.filter(isText);
  }
  createSnapshot() {
    return {
      content: utils_cjs.shallowCopy(this.content),
      meta: utils_cjs.shallowCopy(this.meta),
      role: this.role
    };
  }
  loadSnapshot(snapshot) {
    Object.assign(this, snapshot);
  }
  toPlain() {
    return {
      role: this.role,
      content: utils_cjs.shallowCopy(this.content)
    };
  }
  merge(other) {
    Object.assign(this, other.meta);
    this.content.push(...other.content);
  }
  static fromChunks(chunks) {
    const instance = new this([]);
    chunks.forEach((chunk) => instance.merge(chunk));
    return instance;
  }
  [Symbol.iterator]() {
    return this.content[Symbol.iterator]();
  }
}
class AssistantMessage extends Message {
  static {
    __name(this, "AssistantMessage");
  }
  role = "assistant";
  static {
    this.register();
  }
  getToolCalls() {
    return this.content.filter(isToolCall);
  }
  fromString(text) {
    return {
      type: "text",
      text
    };
  }
}
class ToolMessage extends Message {
  static {
    __name(this, "ToolMessage");
  }
  role = "tool";
  static {
    this.register();
  }
  getToolResults() {
    return this.content.filter(isToolResult);
  }
  fromString(text) {
    const { success, data } = zod.z.object({
      type: zod.z.literal("tool-result"),
      result: zod.z.any(),
      toolName: zod.z.string(),
      toolCallId: zod.z.string()
    }).safeParse(text);
    if (!success) {
      throw new errors_cjs.ValueError(`ToolMessage cannot be created from '${text}'!`);
    }
    return data;
  }
}
class SystemMessage extends Message {
  static {
    __name(this, "SystemMessage");
  }
  role = "system";
  static {
    this.register();
  }
  fromString(text) {
    return {
      type: "text",
      text
    };
  }
}
class UserMessage extends Message {
  static {
    __name(this, "UserMessage");
  }
  role = "user";
  static {
    this.register();
  }
  getImages() {
    return this.content.filter(isImage);
  }
  getFiles() {
    return this.content.filter(isFile);
  }
  fromString(text) {
    return {
      type: "text",
      text
    };
  }
}
const Role = {
  ASSISTANT: "assistant",
  SYSTEM: "system",
  USER: "user"
};
class CustomMessage extends Message {
  static {
    __name(this, "CustomMessage");
  }
  role;
  constructor(role, content, meta = {}) {
    super(content, meta);
    if (!role) {
      throw new errors_cjs.ValueError(`Role "${role}" must be specified!`);
    }
    this.role = role;
  }
  fromString(input) {
    return {
      type: "text",
      text: input
    };
  }
}

exports.AssistantMessage = AssistantMessage;
exports.CustomMessage = CustomMessage;
exports.Message = Message;
exports.Role = Role;
exports.SystemMessage = SystemMessage;
exports.ToolMessage = ToolMessage;
exports.UserMessage = UserMessage;
//# sourceMappingURL=message.cjs.map
//# sourceMappingURL=message.cjs.map