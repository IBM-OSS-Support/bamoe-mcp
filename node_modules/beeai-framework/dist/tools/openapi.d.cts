import { BaseCache } from '../cache/base.cjs';
import * as promise_based_task from 'promise-based-task';
import { BaseToolOptions, StringToolOutput, Tool, ToolEmitter, BaseToolRunOptions } from './base.cjs';
import { C as Callback, E as Emitter } from '../emitter-D5Mu0EEH.cjs';
import { GetRunContext } from '../context.cjs';
import { SchemaObject } from 'ajv';
import '../internals/serializable.cjs';
import '../internals/types.cjs';
import '../internals/helpers/guards.cjs';
import '../errors.cjs';
import '../internals/helpers/schema.cjs';
import 'zod';
import 'zod-to-json-schema';
import '../internals/helpers/promise.cjs';

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
