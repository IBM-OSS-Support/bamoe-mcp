import { BaseCache } from '../cache/base.js';
import * as promise_based_task from 'promise-based-task';
import { BaseToolOptions, StringToolOutput, Tool, ToolEmitter, BaseToolRunOptions } from './base.js';
import { C as Callback, E as Emitter } from '../emitter-C3dO-s2P.js';
import { GetRunContext } from '../context.js';
import { SchemaObject } from 'ajv';
import '../internals/serializable.js';
import '../internals/types.js';
import '../internals/helpers/guards.js';
import '../errors.js';
import '../internals/helpers/schema.js';
import 'zod';
import 'zod-to-json-schema';
import '../internals/helpers/promise.js';

interface OpenAPIToolOptions extends BaseToolOptions {
    name?: string;
    description?: string;
    openApiSchema: any;
    url?: string;
    fetchOptions?: RequestInit;
}
interface OpenAPIEvents {
    beforeFetch: Callback<{
        options: RequestInit;
        url: URL;
    }>;
    afterFetch: Callback<{
        data: OpenAPIToolOutput;
        url: URL;
    }>;
}
declare class OpenAPIToolOutput extends StringToolOutput {
    readonly status: number;
    readonly statusText: string;
    readonly result: string;
    constructor(status: number, statusText: string, result?: string);
}
declare class OpenAPITool extends Tool<OpenAPIToolOutput, OpenAPIToolOptions> {
    readonly name: string;
    readonly description: string;
    readonly url: string;
    readonly openApiSchema: any;
    inputSchema(): SchemaObject;
    readonly emitter: ToolEmitter<Record<string, any>, OpenAPIToolOutput, OpenAPIEvents>;
    constructor(options: OpenAPIToolOptions);
    protected _run(input: Record<string, any>, _options: Partial<BaseToolRunOptions>, run: GetRunContext<typeof this>): Promise<OpenAPIToolOutput>;
    createSnapshot(): {
        openApiSchema: any;
        name: string;
        description: string;
        url: string;
        options: OpenAPIToolOptions;
        cache: BaseCache<promise_based_task.Task<OpenAPIToolOutput, any>>;
        emitter: Emitter<any>;
    };
}

export { type OpenAPIEvents, OpenAPITool, type OpenAPIToolOptions, OpenAPIToolOutput };
