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
type ServerFactory<TInput, TInternal> = (input: TInput) => Promise<TInternal>;
type FactoryMember<TInput> = abstract new (...args: any[]) => TInput | (new (...args: any[]) => TInput) | ((...args: any[]) => TInput);
declare abstract class Server<TInput extends object = object, TInternal extends object = object, TConfig extends object = object> {
    protected config: TConfig;
    static readonly factories: Map<object, ServerFactory<TInput, TInternal>>;
    readonly members: TInput[];
    constructor(config: TConfig);
    static registerFactory<TInput2 extends object, TInternal2 extends object>(this: typeof Server<TInput2, TInternal2, any>, ref: FactoryMember<TInput2>, factory: ServerFactory<TInput2, TInternal2>, override?: boolean): void;
    register(input: TInput): this;
    registerMany(input: TInput[]): this;
    deregister(input: TInput): this;
    protected getFactory(input: TInput): ServerFactory<TInput, TInternal>;
    abstract serve(): void;
}

export { type FactoryMember, Server };
