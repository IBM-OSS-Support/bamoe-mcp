'use strict';

var errors_cjs = require('../errors.cjs');
var serializable_cjs = require('./serializable.cjs');
var nodeFetchEventSource = require('@ai-zen/node-fetch-event-source');
var promise_cjs = require('./helpers/promise.cjs');
var remeda = require('remeda');
var emitter_cjs = require('../emitter/emitter.cjs');
var utils_cjs = require('../serializer/utils.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class RestfulClientError extends errors_cjs.FrameworkError {
  static {
    __name(this, "RestfulClientError");
  }
}
function createURLParams(data) {
  const urlTokenParams = new URLSearchParams();
  for (const [key, value] of Object.entries(data)) {
    if (value === void 0) {
      continue;
    }
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v !== void 0) {
          urlTokenParams.append(key, String(v));
        }
      });
    } else if (remeda.isPlainObject(value)) {
      urlTokenParams.set(key, createURLParams(value).toString());
    } else {
      urlTokenParams.set(key, String(value));
    }
  }
  return urlTokenParams;
}
__name(createURLParams, "createURLParams");
class RestfulClient extends serializable_cjs.Serializable {
  static {
    __name(this, "RestfulClient");
  }
  input;
  emitter;
  constructor(input) {
    super(), this.input = input, this.emitter = emitter_cjs.Emitter.root.child({
      namespace: [
        "internals",
        "restfulClient"
      ],
      creator: this
    });
  }
  async *stream(path, init) {
    const emitter = this.emitter.child({
      groupId: "stream"
    });
    const input = {
      url: this.getUrl(path).toString(),
      options: {
        method: "POST",
        ...init,
        headers: await this.getHeaders(init?.headers)
      }
    };
    await emitter.emit("streamStart", {
      input
    });
    return yield* promise_cjs.emitterToGenerator(async ({ emit }) => nodeFetchEventSource.fetchEventSource(input.url, {
      ...input.options,
      async onopen(response) {
        const contentType = response.headers.get("content-type") || "";
        if (response.ok && contentType.includes(nodeFetchEventSource.EventStreamContentType)) {
          await emitter.emit("streamOpen", {
            input
          });
          return;
        }
        throw new RestfulClientError("Failed to stream!", [], {
          context: {
            url: response.url,
            err: await response.text(),
            response
          },
          isRetryable: response.status >= 400 && response.status < 500 && response.status !== 429
        });
      },
      async onmessage(msg) {
        if (msg?.event === "error") {
          throw new RestfulClientError(`Error during streaming has occurred.`, [], {
            context: msg
          });
        }
        await emitter.emit("streamMessage", {
          input,
          data: msg
        });
        emit(msg);
      },
      onclose() {
      },
      onerror(err) {
        throw new RestfulClientError(`Error during streaming has occurred.`, [
          err
        ]);
      }
    }).then(() => emitter.emit("streamSuccess", {
      input
    })).catch(async (error) => {
      await emitter.emit("streamError", {
        input,
        error
      }).catch(remeda.doNothing());
      throw error;
    }).finally(() => emitter.emit("streamDone", {
      input
    })));
  }
  async fetch(path, init) {
    const emitter = this.emitter.child({
      groupId: "fetch"
    });
    const target = this.getUrl(path);
    if (init?.searchParams) {
      for (const [key, value] of init.searchParams) {
        target.searchParams.set(key, value);
      }
    }
    const input = {
      url: target.toString(),
      options: {
        ...init,
        headers: await this.getHeaders(init?.headers)
      }
    };
    await emitter.emit("fetchStart", {
      input
    });
    try {
      const response = await fetch(input.url, input.options);
      if (!response.ok) {
        throw new RestfulClientError("Fetch has failed", [], {
          context: {
            url: response.url,
            error: await response.text(),
            response
          },
          isRetryable: [
            408,
            503
          ].includes(response.status ?? 500)
        });
      }
      const data = await response.json();
      await emitter.emit("fetchSuccess", {
        response,
        data,
        input
      });
      return data;
    } catch (error) {
      await emitter.emit("fetchError", {
        error,
        input
      });
      throw error;
    } finally {
      await emitter.emit("fetchDone", {
        input
      });
    }
  }
  async getHeaders(extra) {
    const final = {};
    for (const override of [
      await this.input.headers?.(),
      extra
    ].filter(remeda.isTruthy)) {
      if (remeda.isArray(override) || override instanceof Headers) {
        Object.assign(final, Object.fromEntries(override.entries()));
      } else {
        Object.assign(final, override);
      }
    }
    return final;
  }
  getUrl(path) {
    const url = new URL(this.input.baseUrl);
    const extraPath = this.input.paths[path] ?? path;
    if (url.pathname.endsWith("/")) {
      url.pathname += extraPath.replace(/^\//, "");
    } else {
      url.pathname += extraPath;
    }
    return url;
  }
  createSnapshot() {
    return {
      input: utils_cjs.shallowCopy(this.input),
      emitter: this.emitter
    };
  }
  loadSnapshot(snapshot) {
    Object.assign(this, snapshot);
  }
}

exports.RestfulClient = RestfulClient;
exports.RestfulClientError = RestfulClientError;
exports.createURLParams = createURLParams;
//# sourceMappingURL=fetcher.cjs.map
//# sourceMappingURL=fetcher.cjs.map