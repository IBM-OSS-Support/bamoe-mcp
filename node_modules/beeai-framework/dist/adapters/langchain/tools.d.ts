import { BaseCache } from '../../cache/base.js';
import * as promise_based_task from 'promise-based-task';
import { BaseToolRunOptions, BaseToolOptions, JSONToolOutput, Tool, ToolEmitter, ToolEvents, ToolInput } from '../../tools/base.js';
import { GetRunContext } from '../../context.js';
import { RunnableConfig } from '@langchain/core/runnables';
import * as LCTools from '@langchain/core/tools';
import { E as Emitter } from '../../emitter-C3dO-s2P.js';
import '../../internals/serializable.js';
import '../../internals/types.js';
import '../../internals/helpers/guards.js';
import 'ajv';
import '../../errors.js';
import '../../internals/helpers/schema.js';
import 'zod';
import 'zod-to-json-schema';
import '../../internals/helpers/promise.js';

type LangChainToolRunOptions = RunnableConfig & BaseToolRunOptions;
type LangChainToolOptions<TOutput = any> = BaseToolOptions & {
    outputClass?: typeof JSONToolOutput<TOutput>;
};
declare class LangChainTool<T extends LCTools.StructuredTool, TOutput = any> extends Tool<JSONToolOutput<TOutput>, LangChainToolOptions<TOutput>, LangChainToolRunOptions> {
    name: string;
    description: string;
    protected readonly tool: T;
    static serializedSchemaKey: "_internalJsonSchema";
    readonly emitter: ToolEmitter<ToolEvents<T>, JSONToolOutput<TOutput>>;
    constructor({ tool, ...options }: LangChainToolOptions<TOutput> & {
        tool: T;
    });
    inputSchema(): T["schema"];
    protected _run(arg: ToolInput<this>, options: Partial<LangChainToolRunOptions>, run: GetRunContext<this>): Promise<JSONToolOutput<TOutput>>;
    createSnapshot(): {
        tool: T;
        name: string;
        description: string;
        options: LangChainToolOptions<TOutput>;
        cache: BaseCache<promise_based_task.Task<JSONToolOutput<TOutput>, any>>;
        emitter: Emitter<any>;
    };
    loadSnapshot(snapshot: ReturnType<typeof this.createSnapshot>): void;
}

export { LangChainTool, type LangChainToolOptions, type LangChainToolRunOptions };
