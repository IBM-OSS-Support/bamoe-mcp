import { Tool } from '../base.js';
import { z } from 'zod';
import { Emitter } from '../../emitter/emitter.js';
import { createURLParams } from '../../internals/fetcher.js';
import { SearchToolOutput } from './base.js';
import { ValidationError } from 'ajv';
import { parseEnv } from '../../internals/env.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class SearXNGToolOutput extends SearchToolOutput {
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
class SearXNGTool extends Tool {
  static {
    __name(this, "SearXNGTool");
  }
  name = "Web Search";
  description = `Search for online trends, news, current events, real-time information, or research topics.`;
  emitter = Emitter.root.child({
    namespace: [
      "tool",
      "search",
      "searXNG"
    ],
    creator: this
  });
  inputSchema() {
    return z.object({
      query: z.string().min(1).describe(`Web search query.`)
    });
  }
  constructor(options = {
    maxResults: 10
  }) {
    super(options);
    if (options.maxResults < 1 || options.maxResults > 100) {
      throw new ValidationError([
        {
          message: "Property 'maxResults' must be between 1 and 100",
          propertyName: "options.maxResults"
        }
      ]);
    }
  }
  async _run(input, _options, run) {
    const params = createURLParams({
      q: input.query,
      format: "json"
    });
    const baseUrl = this.options.baseUrl || parseEnv("SEARXNG_BASE_URL", z.string());
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

export { SearXNGTool, SearXNGToolOutput };
//# sourceMappingURL=searXNGSearch.js.map
//# sourceMappingURL=searXNGSearch.js.map