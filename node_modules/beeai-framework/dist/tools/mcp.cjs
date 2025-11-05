'use strict';

var base_cjs = require('./base.cjs');
var emitter_cjs = require('../emitter/emitter.cjs');
var paginate_cjs = require('../internals/helpers/paginate.cjs');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class MCPToolOutput extends base_cjs.JSONToolOutput {
  static {
    __name(this, "MCPToolOutput");
  }
}
class MCPTool extends base_cjs.Tool {
  static {
    __name(this, "MCPTool");
  }
  name;
  description;
  emitter;
  client;
  tool;
  constructor({ client, tool, ...options }) {
    super(options);
    this.client = client;
    this.tool = tool;
    this.name = tool.name;
    this.description = tool.description ?? "No available description, use the tool based on its name and schema.";
    this.emitter = emitter_cjs.Emitter.root.child({
      namespace: [
        "tool",
        "mcp",
        this.name
      ],
      creator: this
    });
  }
  inputSchema() {
    return this.tool.inputSchema;
  }
  async _run(input, _options, run) {
    const result = await this.client.callTool({
      name: this.name,
      arguments: input
    }, void 0, {
      signal: run.signal
    });
    return new MCPToolOutput(result);
  }
  static async fromClient(client) {
    const tools = await paginate_cjs.paginate({
      size: Infinity,
      handler: /* @__PURE__ */ __name(async ({ cursor }) => {
        const { tools: tools2, nextCursor } = await client.listTools({
          cursor
        });
        return {
          data: tools2,
          nextCursor
        };
      }, "handler")
    });
    return tools.map((tool) => new MCPTool({
      client,
      tool
    }));
  }
}

exports.MCPTool = MCPTool;
exports.MCPToolOutput = MCPToolOutput;
//# sourceMappingURL=mcp.cjs.map
//# sourceMappingURL=mcp.cjs.map