import { ValueError } from '../../../errors.js';
import { Server } from '../../../serve/server.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Tool } from '../../../tools/base.js';
import { runServer } from './http_server.js';
import { ZodType } from 'zod';

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
class MCPServer extends Server {
  static {
    __name(this, "MCPServer");
  }
  server;
  constructor(config) {
    super(config || new MCPServerConfig());
    this.server = new McpServer({
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
          throw new ValueError("Input type is not supported by this server.");
      }
    }
    if (this.config.transport === "sse") {
      runServer(this.server, this.config.hostname, this.config.port);
    } else {
      await this.server.connect(new StdioServerTransport());
    }
  }
  getFactory(member) {
    const factories = this.constructor.factories;
    return !factories.has(member.constructor) && member instanceof Tool && factories.has(Tool) ? factories.get(Tool) : super.getFactory(member);
  }
}
async function toolFactory(tool) {
  const schema = await tool.inputSchema();
  if (!(schema instanceof ZodType)) {
    throw new ValueError("JsonSchema is not supported for MCP tools.");
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
MCPServer.registerFactory(Tool, toolFactory);

export { MCPServer, MCPServerConfig };
//# sourceMappingURL=server.js.map
//# sourceMappingURL=server.js.map