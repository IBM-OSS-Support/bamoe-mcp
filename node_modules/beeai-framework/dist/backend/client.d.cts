import { Serializable } from '../internals/serializable.cjs';
import '../internals/types.cjs';
import '../internals/helpers/guards.cjs';

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

declare abstract class BackendClient<P, T> extends Serializable {
    readonly instance: T;
    protected readonly settings: P;
    constructor(settings: P);
    protected abstract create(): T;
    createSnapshot(): {
        settings: P;
    };
    loadSnapshot(snapshot: ReturnType<typeof this.createSnapshot>): void;
    static ensure<P2, T2, R extends BackendClient<P2, T2>>(this: new (settings: P2) => R, settings?: P2 | R): R;
}

export { BackendClient };
