'use strict';

var errors_cjs = require('../../../errors.cjs');
var server_cjs = require('../../../serve/server.cjs');
var mcp_js = require('@modelcontextprotocol/sdk/server/mcp.js');
var stdio_js = require('@modelcontextprotocol/sdk/server/stdio.js');
var base_cjs = require('../../../tools/base.cjs');
var http_server_cjs = require('./http_server.cjs');
var zod = require('zod');

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class MCPServerConfig {
  static {
    __name(this, "MCPServerConfig");
  }
  transport = "stdio";
  hostname = "127.0.0.1";
  port = 3e3;
  name = "MCP Server";
  version = "1.0.0";
  settings;
  constructor(partial) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
class MCPServer extends server_cjs.Server {
  static {
    __name(this, "MCPServer");
  }
  server;
  constructor(config) {
    super(config || new MCPServerConfig());
    this.server = new mcp_js.McpServer({
      name: this.config.name,
      version: this.config.version,
      ...this.config.settings
    });
  }
  async serve() {
    for (const member of this.members) {
      const factory = this.getFactory(member);
      const entry = await factory(member);
      switch (entry.type) {
        case "tool":
          this.server.tool(entry.name, entry.description, entry.paramsSchema, entry.callback);
          break;
        case "prompt":
          if ("argsSchema" in entry) {
            this.server.prompt(entry.name, entry.description, entry.argsSchema, entry.callback);
          } else {
            this.server.prompt(entry.name, entry.description, entry.callback);
          }
          break;
        case "resource":
          if ("uri" in entry) {
            this.server.resource(entry.name, entry.uri, entry.callback);
          } else {
            this.server.resource(entry.name, entry.template, entry.callback);
          }
          break;
        default:
          throw new errors_cjs.ValueError("Input type is not supported by this server.");
      }
    }
    if (this.config.transport === "sse") {
      http_server_cjs.runServer(this.server, this.config.hostname, this.config.port);
    } else {
      await this.server.connect(new stdio_js.StdioServerTransport());
    }
  }
  getFactory(member) {
    const factories = this.constructor.factories;
    return !factories.has(member.constructor) && member instanceof base_cjs.Tool && factories.has(base_cjs.Tool) ? factories.get(base_cjs.Tool) : super.getFactory(member);
  }
}
async function toolFactory(tool) {
  const schema = await tool.inputSchema();
  if (!(schema instanceof zod.ZodType)) {
    throw new errors_cjs.ValueError("JsonSchema is not supported for MCP tools.");
  }
  const paramsSchema = schema.shape;
  return {
    type: "tool",
    name: tool.name,
    description: tool.description,
    paramsSchema,
    callback: /* @__PURE__ */ __name(async (...args) => {
      const result = await tool.run(...args);
      return {
        content: [
          {
            type: "text",
            text: result.getTextContent()
          }
        ]
      };
    }, "callback")
  };
}
__name(toolFactory, "toolFactory");
MCPServer.registerFactory(base_cjs.Tool, toolFactory);

exports.MCPServer = MCPServer;
exports.MCPServerConfig = MCPServerConfig;
//# sourceMappingURL=server.cjs.map
//# sourceMappingURL=server.cjs.map