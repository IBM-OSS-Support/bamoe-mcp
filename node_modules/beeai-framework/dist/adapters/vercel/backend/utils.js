import { UserMessage, Role } from '../../../backend/message.js';
import { isString, isPlainObject, isTruthy } from 'remeda';
import { getProp } from '../../../internals/helpers/object.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
function encodeCustomMessage(msg) {
  return new UserMessage([
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
  if (msg.role !== Role.USER) {
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
      value = value.map((val) => val.type === "text" ? val.text || val.content : null).filter(isTruthy).join("");
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
    if (options && isString(options.body) && (getProp(options.headers, [
      "content-type"
    ]) == "application/json" || getProp(options.headers, [
      "Content-Type"
    ]) == "application/json")) {
      const body = JSON.parse(options.body);
      if (isPlainObject(body) && Array.isArray(body.messages)) {
        body.messages.forEach((msg) => {
          if (!isPlainObject(msg)) {
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

export { decodeCustomMessage, encodeCustomMessage, vercelFetcher };
//# sourceMappingURL=utils.js.map
//# sourceMappingURL=utils.js.map