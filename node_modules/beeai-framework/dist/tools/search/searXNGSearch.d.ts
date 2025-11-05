import { Tool, ToolEmitter, ToolInput } from '../base.js';
import { z } from 'zod';
import { RunContext } from '../../context.js';
import { SearchToolOptions, SearchToolResult, SearchToolOutput, SearchToolRunOptions } from './base.js';
import 'ajv';
import '../../errors.js';
import '../../internals/types.js';
import '../../internals/helpers/guards.js';
import '../../internals/serializable.js';
import 'promise-based-task';
import '../../cache/base.js';
import '../../internals/helpers/schema.js';
import 'zod-to-json-schema';
import '../../emitter-C3dO-s2P.js';
import '../../internals/helpers/promise.js';

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

interface SearXNGToolOptions extends SearchToolOptions {
    baseUrl?: string;
    maxResults: number;
}
type SearXNGToolRunOptions = SearchToolRunOptions;
interface SearXNGToolResult extends SearchToolResult {
}
declare class SearXNGToolOutput extends SearchToolOutput<SearXNGToolResult> {
    createSnapshot(): {
        results: SearXNGToolResult[];
    };
    loadSnapshot(snapshot: ReturnType<typeof this.createSnapshot>): void;
}
declare class SearXNGTool extends Tool<SearXNGToolOutput, SearXNGToolOptions, SearXNGToolRunOptions> {
    name: string;
    description: string;
    readonly emitter: ToolEmitter<ToolInput<this>, SearchToolOutput<SearXNGToolResult>>;
    inputSchema(): z.ZodObject<{
        query: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        query: string;
    }, {
        query: string;
    }>;
    constructor(options?: SearXNGToolOptions);
    protected _run(input: ToolInput<this>, _options: Partial<SearchToolRunOptions>, run: RunContext<this>): Promise<SearXNGToolOutput>;
}

export { SearXNGTool, type SearXNGToolOptions, SearXNGToolOutput, type SearXNGToolResult };
