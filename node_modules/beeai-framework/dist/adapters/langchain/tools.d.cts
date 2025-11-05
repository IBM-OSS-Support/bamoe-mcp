import { BaseCache } from '../../cache/base.cjs';
import * as promise_based_task from 'promise-based-task';
import { BaseToolRunOptions, BaseToolOptions, JSONToolOutput, Tool, ToolEmitter, ToolEvents, ToolInput } from '../../tools/base.cjs';
import { GetRunContext } from '../../context.cjs';
import { RunnableConfig } from '@langchain/core/runnables';
import * as LCTools from '@langchain/core/tools';
import { E as Emitter } from '../../emitter-D5Mu0EEH.cjs';
import '../../internals/serializable.cjs';
import '../../internals/types.cjs';
import '../../internals/helpers/guards.cjs';
import 'ajv';
import '../../errors.cjs';
import '../../internals/helpers/schema.cjs';
import 'zod';
import 'zod-to-json-schema';
import '../../internals/helpers/promise.cjs';

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
