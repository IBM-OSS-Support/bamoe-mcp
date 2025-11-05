'use strict';

var base_cjs$1 = require('../base.cjs');
var zod = require('zod');
var emitter_cjs = require('../../emitter/emitter.cjs');
var fetcher_cjs = require('../../internals/fetcher.cjs');
var base_cjs = require('./base.cjs');
var ajv = require('ajv');
var env_cjs = require('../../internals/env.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class SearXNGToolOutput extends base_cjs.SearchToolOutput {
  static {
    __name(this, "SearXNGToolOutput");
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
class SearXNGTool extends base_cjs$1.Tool {
  static {
    __name(this, "SearXNGTool");
  }
  name = "Web Search";
  description = `Search for online trends, news, current events, real-time information, or research topics.`;
  emitter = emitter_cjs.Emitter.root.child({
    namespace: [
      "tool",
      "search",
      "searXNG"
    ],
    creator: this
  });
  inputSchema() {
    return zod.z.object({
      query: zod.z.string().min(1).describe(`Web search query.`)
    });
  }
  constructor(options = {
    maxResults: 10
  }) {
    super(options);
    if (options.maxResults < 1 || options.maxResults > 100) {
      throw new ajv.ValidationError([
        {
          message: "Property 'maxResults' must be between 1 and 100",
          propertyName: "options.maxResults"
        }
      ]);
    }
  }
  async _run(input, _options, run) {
    const params = fetcher_cjs.createURLParams({
      q: input.query,
      format: "json"
    });
    const baseUrl = this.options.baseUrl || env_cjs.parseEnv("SEARXNG_BASE_URL", zod.z.string());
    const url = `${baseUrl}?${decodeURIComponent(params.toString())}`;
    const response = await fetch(url, {
      signal: run.signal
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const data = await response.json();
    return new SearXNGToolOutput(data.results.slice(0, this.options.maxResults).map((result) => ({
      url: result.url || "",
      title: result.title || "",
      description: result.content || ""
    })));
  }
}

exports.SearXNGTool = SearXNGTool;
exports.SearXNGToolOutput = SearXNGToolOutput;
//# sourceMappingURL=searXNGSearch.cjs.map
//# sourceMappingURL=searXNGSearch.cjs.map