'use strict';

var message_cjs = require('../../../backend/message.cjs');
var remeda = require('remeda');
var object_cjs = require('../../../internals/helpers/object.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function encodeCustomMessage(msg) {
  return new message_cjs.UserMessage([
    {
      type: "text",
      text: `#custom_role#${msg.role}#`
    },
    ...msg.content.slice()
  ]);
}
__name(encodeCustomMessage, "encodeCustomMessage");
function decodeCustomMessage(value) {
  const [_, id, role, ...content] = value.split("#");
  if (id !== "custom_role") {
    return;
  }
  return {
    role,
    content: content.join("#")
  };
}
__name(decodeCustomMessage, "decodeCustomMessage");
function unmaskCustomMessage(msg) {
  if (msg.role !== message_cjs.Role.USER) {
    return;
  }
  for (const key of [
    "content",
    "text"
  ]) {
    let value = msg[key];
    if (!value) {
      continue;
    }
    if (Array.isArray(value)) {
      value = value.map((val) => val.type === "text" ? val.text || val.content : null).filter(remeda.isTruthy).join("");
    }
    const decoded = decodeCustomMessage(value);
    if (decoded) {
      msg.role = decoded.role;
      msg[key] = decoded.content;
      break;
    }
  }
}
__name(unmaskCustomMessage, "unmaskCustomMessage");
function vercelFetcher(customFetch) {
  return async (url, options) => {
    if (options && remeda.isString(options.body) && (object_cjs.getProp(options.headers, [
      "content-type"
    ]) == "application/json" || object_cjs.getProp(options.headers, [
      "Content-Type"
    ]) == "application/json")) {
      const body = JSON.parse(options.body);
      if (remeda.isPlainObject(body) && Array.isArray(body.messages)) {
        body.messages.forEach((msg) => {
          if (!remeda.isPlainObject(msg)) {
            return;
          }
          unmaskCustomMessage(msg);
        });
      }
      options.body = JSON.stringify(body);
    }
    const fetcher = customFetch ?? fetch;
    return await fetcher(url, options);
  };
}
__name(vercelFetcher, "vercelFetcher");

exports.decodeCustomMessage = decodeCustomMessage;
exports.encodeCustomMessage = encodeCustomMessage;
exports.vercelFetcher = vercelFetcher;
//# sourceMappingURL=utils.cjs.map
//# sourceMappingURL=utils.cjs.map