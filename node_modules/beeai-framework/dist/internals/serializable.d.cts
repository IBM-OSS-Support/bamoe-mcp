import { ClassConstructor } from './types.cjs';
import './helpers/guards.cjs';

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

type SerializableClass<T> = ClassConstructor<Serializable<T>> & Pick<typeof Serializable<T>, "fromSnapshot" | "fromSerialized">;
interface DeserializeOptions {
    extraClasses?: SerializableClass<unknown>[];
}
declare abstract class Serializable<T = unknown> {
    abstract createSnapshot(): T | Promise<T>;
    abstract loadSnapshot(snapshot: T): void | Promise<void>;
    constructor();
    static register<T>(this: SerializableClass<T>, aliases?: string[]): void;
    clone<T extends Serializable>(this: T): Promise<T>;
    serialize(): Promise<string>;
    protected deserialize(value: string, options?: DeserializeOptions): Promise<T>;
    static fromSnapshot<P, T extends Serializable<P>>(this: new (...args: any[]) => T, state: P): Promise<T>;
    static fromSerialized<T extends Serializable>(this: abstract new (...args: any[]) => T, serialized: string, options?: DeserializeOptions): Promise<T>;
}

export { type DeserializeOptions, Serializable, type SerializableClass };
