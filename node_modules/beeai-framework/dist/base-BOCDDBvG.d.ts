import { Run, GetRunContext } from './context.js';
import { FrameworkError } from './errors.js';
import { Serializable } from './internals/serializable.js';
import { E as Emitter } from './emitter-C3dO-s2P.js';
import { BaseMemory } from './memory/base.js';
import { OmitEmpty } from './internals/types.js';
import { AnyTool } from './tools/base.js';

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

interface AgentMeta {
    name: string;
    description: string;
    extraDescription?: string;
    tools: AnyTool[];
}
type AgentCallbackValue = {
    data?: never;
    error: Error;
} | {
    data: unknown;
    error?: never;
} | object;
type InternalAgentCallbackValue<T extends AgentCallbackValue, E extends NonNullable<unknown>> = OmitEmpty<T> & E;
type PublicAgentCallbackValue<T extends AgentCallbackValue = AgentCallbackValue> = OmitEmpty<T>;
type AgentCallback<T extends PublicAgentCallbackValue> = (value: T) => void;
type GetAgentInput<T> = T extends BaseAgent<infer X, any, any> ? X : never;
type GetAgentOutput<T> = T extends BaseAgent<any, infer X, any> ? X : never;
type AnyAgent = BaseAgent<any, any, any>;

declare class AgentError extends FrameworkError {
}
interface BaseAgentRunOptions {
    signal?: AbortSignal;
}
declare abstract class BaseAgent<TInput, TOutput, TOptions extends BaseAgentRunOptions = BaseAgentRunOptions> extends Serializable {
    protected isRunning: boolean;
    abstract readonly emitter: Emitter<unknown>;
    run(...[input, options]: Partial<TOptions> extends TOptions ? [input: TInput, options?: TOptions] : [input: TInput, options: TOptions]): Run<TOutput, this, readonly [TInput, TOptions | undefined]>;
    protected abstract _run(input: TInput, options: TOptions, run: GetRunContext<typeof this>): Promise<TOutput>;
    destroy(): void;
    abstract set memory(memory: BaseMemory);
    abstract get memory(): BaseMemory;
    get meta(): AgentMeta;
    createSnapshot(): {
        isRunning: boolean;
        emitter: Emitter<unknown>;
    };
    loadSnapshot(snapshot: ReturnType<typeof this.createSnapshot>): void;
}

export { AgentError as A, type BaseAgentRunOptions as B, type GetAgentInput as G, type InternalAgentCallbackValue as I, type PublicAgentCallbackValue as P, BaseAgent as a, type AgentMeta as b, type AgentCallbackValue as c, type AgentCallback as d, type GetAgentOutput as e, type AnyAgent as f };
