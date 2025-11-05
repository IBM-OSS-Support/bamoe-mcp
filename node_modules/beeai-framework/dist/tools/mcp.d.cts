import { JSONToolOutput, Tool, ToolEmitter, ToolInput, BaseToolRunOptions } from './base.cjs';
import { GetRunContext } from '../context.cjs';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { ListToolsResult } from '@modelcontextprotocol/sdk/types.js';
import { SchemaObject } from 'ajv';
import '../errors.cjs';
import '../internals/types.cjs';
import '../internals/helpers/guards.cjs';
import '../internals/serializable.cjs';
import 'promise-based-task';
import '../cache/base.cjs';
import '../internals/helpers/schema.cjs';
import 'zod';
import 'zod-to-json-schema';
import '../emitter-D5Mu0EEH.cjs';
import '../internals/helpers/promise.cjs';

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

interface MCPToolInput {
    client: Client;
    tool: ListToolsResult["tools"][number];
}
declare class MCPToolOutput extends JSONToolOutput<any> {
}
declare class MCPTool extends Tool<MCPToolOutput> {
    readonly name: string;
    readonly description: string;
    readonly emitter: ToolEmitter<ToolInput<this>, MCPToolOutput>;
    readonly client: Client;
    private readonly tool;
    constructor({ client, tool, ...options }: MCPToolInput);
    inputSchema(): SchemaObject;
    protected _run(input: ToolInput<this>, _options: BaseToolRunOptions, run: GetRunContext<typeof this>): Promise<MCPToolOutput>;
    static fromClient(client: Client): Promise<MCPTool[]>;
}

export { MCPTool, type MCPToolInput, MCPToolOutput };
