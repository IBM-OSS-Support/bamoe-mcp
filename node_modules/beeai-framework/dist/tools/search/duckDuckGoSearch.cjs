'use strict';

var duckDuckScrape = require('duck-duck-scrape');
var base_cjs = require('./base.cjs');
var base_cjs$1 = require('../base.cjs');
var headerGenerator = require('header-generator');
var zod = require('zod');
var decoratorCache_cjs = require('../../cache/decoratorCache.cjs');
var paginate_cjs = require('../../internals/helpers/paginate.cjs');
var emitter_cjs = require('../../emitter/emitter.cjs');

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
class DuckDuckGoSearchToolOutput extends base_cjs.SearchToolOutput {
  static {
    __name(this, "DuckDuckGoSearchToolOutput");
  }
  results;
  constructor(results) {
    super(results), this.results = results;
  }
  static {
    this.register();
  }
  createSnapshot() {
    return {
      results: this.results
    };
  }
  loadSnapshot(snapshot) {
    Object.assign(this, snapshot);
  }
}
class DuckDuckGoSearchTool extends base_cjs$1.Tool {
  static {
    __name(this, "DuckDuckGoSearchTool");
  }
  name = "DuckDuckGo";
  description = "Search for online trends, news, current events, real-time information, or research topics.";
  emitter = emitter_cjs.Emitter.root.child({
    namespace: [
      "tool",
      "search",
      "ddg"
    ],
    creator: this
  });
  inputSchema() {
    return zod.z.object({
      query: zod.z.string({
        description: `Search query`
      }).min(1).max(128)
    });
  }
  constructor(options = {}) {
    super({
      ...options,
      maxResults: options?.maxResults ?? 15
    });
  }
  static {
    this.register();
  }
  async _createClient() {
    const { throttle } = this.options;
    if (throttle === false) {
      return duckDuckScrape.search;
    }
    const { default: pThrottle } = await import('p-throttle');
    return pThrottle({
      ...throttle,
      limit: throttle?.limit ?? 1,
      interval: throttle?.interval ?? 3e3
    })(duckDuckScrape.search);
  }
  async _run({ query: input }, options, run) {
    const headers = new headerGenerator.HeaderGenerator().getHeaders();
    const client = await this._createClient();
    const results = await paginate_cjs.paginate({
      size: this.options.maxResults,
      handler: /* @__PURE__ */ __name(async ({ cursor = 0 }) => {
        const { results: data, noResults: done } = await client(input, {
          safeSearch: duckDuckScrape.SafeSearchType.MODERATE,
          ...this.options.search,
          ...options?.search,
          offset: cursor
        }, {
          headers,
          user_agent: headers["user-agent"],
          ...this.options?.httpClientOptions,
          ...options?.httpClientOptions,
          signal: run.signal,
          uri_modifier: /* @__PURE__ */ __name((rawUrl) => {
            const url = new URL(rawUrl);
            url.searchParams.delete("ss_mkt");
            return url.toString();
          }, "uri_modifier")
        });
        return {
          data,
          nextCursor: done ? void 0 : cursor + data.length
        };
      }, "handler")
    });
    const { stripHtml } = await import('string-strip-html');
    return new DuckDuckGoSearchToolOutput(results.map((result) => ({
      title: stripHtml(result.title).result,
      description: stripHtml(result.description).result,
      url: result.url
    })));
  }
}
_ts_decorate([
  decoratorCache_cjs.Cache(),
  _ts_metadata("design:type", Function),
  _ts_metadata("design:paramtypes", []),
  _ts_metadata("design:returntype", void 0)
], DuckDuckGoSearchTool.prototype, "inputSchema", null);
_ts_decorate([
  decoratorCache_cjs.Cache({
    enumerable: false
  }),
  _ts_metadata("design:type", Function),
  _ts_metadata("design:paramtypes", []),
  _ts_metadata("design:returntype", Promise)
], DuckDuckGoSearchTool.prototype, "_createClient", null);

Object.defineProperty(exports, "DuckDuckGoSearchToolSearchType", {
  enumerable: true,
  get: function () { return duckDuckScrape.SafeSearchType; }
});
exports.DuckDuckGoSearchTool = DuckDuckGoSearchTool;
exports.DuckDuckGoSearchToolOutput = DuckDuckGoSearchToolOutput;
//# sourceMappingURL=duckDuckGoSearch.cjs.map
//# sourceMappingURL=duckDuckGoSearch.cjs.map