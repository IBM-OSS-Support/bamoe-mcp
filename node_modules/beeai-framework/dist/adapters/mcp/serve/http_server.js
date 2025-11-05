import express from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { InMemoryEventStore } from './in_memory_store.js';
import { randomUUID } from 'node:crypto';
import { Logger } from '../../../logger/logger.js';

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const logger = Logger.root.child({
  name: "MCP HTTP server"
});
function runServer(server, hostname = "127.0.0.1", port = 3e3) {
  const app = express();
  app.use(express.json());
  const transports = {};
  app.all("/mcp", async (req, res) => {
    logger.debug(`Received ${req.method} request to /mcp`);
    try {
      const sessionId = req.headers["mcp-session-id"];
      let transport;
      if (sessionId && transports[sessionId]) {
        const existingTransport = transports[sessionId];
        if (existingTransport instanceof StreamableHTTPServerTransport) {
          transport = existingTransport;
        } else {
          res.status(400).json({
            jsonrpc: "2.0",
            error: {
              code: -32e3,
              message: "Bad Request: Session exists but uses a different transport protocol"
            },
            id: null
          });
          return;
        }
      } else if (!sessionId && req.method === "POST" && isInitializeRequest(req.body)) {
        const eventStore = new InMemoryEventStore();
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: /* @__PURE__ */ __name(() => randomUUID(), "sessionIdGenerator"),
          eventStore,
          // Enable resumability
          onsessioninitialized: /* @__PURE__ */ __name((sessionId2) => {
            logger.debug(`StreamableHTTP session initialized with ID: ${sessionId2}`);
            transports[sessionId2] = transport;
          }, "onsessioninitialized")
        });
        transport.onclose = () => {
          const sid = transport.sessionId;
          if (sid && transports[sid]) {
            logger.debug(`Transport closed for session ${sid}, removing from transports map`);
            delete transports[sid];
          }
        };
        await server.connect(transport);
      } else {
        res.status(400).json({
          jsonrpc: "2.0",
          error: {
            code: -32e3,
            message: "Bad Request: No valid session ID provided"
          },
          id: null
        });
        return;
      }
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      logger.error("Error handling MCP request:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Internal server error"
          },
          id: null
        });
      }
    }
  });
  app.get("/sse", async (req, res) => {
    logger.info("Received GET request to /sse (deprecated SSE transport)");
    const transport = new SSEServerTransport("/messages", res);
    transports[transport.sessionId] = transport;
    res.on("close", () => {
      delete transports[transport.sessionId];
    });
    await server.connect(transport);
  });
  app.post("/messages", async (req, res) => {
    const sessionId = req.query.sessionId;
    let transport;
    const existingTransport = transports[sessionId];
    if (existingTransport instanceof SSEServerTransport) {
      transport = existingTransport;
    } else {
      res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32e3,
          message: "Bad Request: Session exists but uses a different transport protocol"
        },
        id: null
      });
      return;
    }
    if (transport) {
      await transport.handlePostMessage(req, res, req.body);
    } else {
      res.status(400).send("No transport found for sessionId");
    }
  });
  app.listen(port, hostname, () => {
    logger.info(`Backwards compatible MCP server listening on port ${hostname}:${port}`);
    logger.debug(`
    ==============================================
    SUPPORTED TRANSPORT OPTIONS:

    1. Streamable Http(Protocol version: 2025-03-26)
    Endpoint: /mcp
    Methods: GET, POST, DELETE
    Usage: 
        - Initialize with POST to /mcp
        - Establish SSE stream with GET to /mcp
        - Send requests with POST to /mcp
        - Terminate session with DELETE to /mcp

    2. Http + SSE (Protocol version: 2024-11-05)
    Endpoints: /sse (GET) and /messages (POST)
    Usage:
        - Establish SSE stream with GET to /sse
        - Send requests with POST to /messages?sessionId=<id>
    ==============================================
    `);
  });
  process.on("SIGINT", async () => {
    logger.info("Shutting down server...");
    for (const sessionId in transports) {
      try {
        logger.debug(`Closing transport for session ${sessionId}`);
        await transports[sessionId].close();
        delete transports[sessionId];
      } catch (error) {
        logger.error(`Error closing transport for session ${sessionId}:`, error);
      }
    }
    logger.debug("Server shutdown complete");
    process.exit(0);
  });
}
__name(runServer, "runServer");

export { runServer };
//# sourceMappingURL=http_server.js.map
//# sourceMappingURL=http_server.js.map