import { Server } from '../../../serve/server.cjs';
import { ServerOptions } from '@modelcontextprotocol/sdk/server/index.js';
import { PromptCallback, ReadResourceCallback, ResourceTemplate, ReadResourceTemplateCallback, ToolCallback, McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ZodRawShape } from 'zod';
import { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';

/**
 * Copyright 2025 © BeeAI a Series of LF Projects, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

type MCPServerPrompt = {
    type: "prompt";
    name: string;
    description: string;
    callback: PromptCallback;
} | {
    type: "prompt";
    name: string;
    description: string;
    argsSchema: ZodRawShape;
    callback: PromptCallback<ZodRawShape>;
};
type MCPServerResource = {
    type: "resource";
    name: string;
    uri: string;
    callback: ReadResourceCallback;
} | {
    type: "resource";
    name: string;
    template: ResourceTemplate;
    callback: ReadResourceTemplateCallback;
};
interface MCPServerTool {
    type: "tool";
    name: string;
    description: string;
    paramsSchema: ZodRawShape | ToolAnnotations;
    callback: ToolCallback<ZodRawShape>;
}
type MCPServerEntry = MCPServerPrompt | MCPServerResource | MCPServerTool;
declare class MCPServerConfig {
    transport: "stdio" | "sse";
    hostname: string;
    port: number;
    name: string;
    version: string;
    settings?: ServerOptions;
    constructor(partial?: Partial<MCPServerConfig>);
}
declare class MCPServer extends Server<any, MCPServerEntry, MCPServerConfig> {
    protected server: McpServer;
    constructor(config?: MCPServerConfig);
    serve(): Promise<void>;
    getFactory(member: any): (input: TInput) => Promise<TInternal>;
}

export { MCPServer, MCPServerConfig };
