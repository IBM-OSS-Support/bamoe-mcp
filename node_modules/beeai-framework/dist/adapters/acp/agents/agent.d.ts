import { E as Emitter } from '../../../emitter-C3dO-s2P.js';
import { a as BaseAgent, B as BaseAgentRunOptions } from '../../../base-BOCDDBvG.js';
import { GetRunContext } from '../../../context.js';
import { Message } from '../../../backend/message.js';
import { BaseMemory } from '../../../memory/base.js';
import { RestfulClient } from '../../../internals/fetcher.js';
import { ACPAgentRunInput, ACPAgentRunOutput, ACPAgentInput } from './types.js';
import { ACPAgentEvents } from './events.js';
import '../../../internals/types.js';
import '../../../internals/helpers/guards.js';
import '../../../internals/serializable.js';
import '../../../errors.js';
import '../../../tools/base.js';
import 'ajv';
import 'promise-based-task';
import '../../../cache/base.js';
import '../../../internals/helpers/schema.js';
import 'zod';
import 'zod-to-json-schema';
import '../../../internals/helpers/promise.js';
import 'ai';
import '@ai-zen/node-fetch-event-source';
import '@ai-zen/node-fetch-event-source/lib/cjs/fetch.js';

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

declare class ACPAgent extends BaseAgent<ACPAgentRunInput, ACPAgentRunOutput> {
    protected readonly input: ACPAgentInput;
    readonly emitter: Emitter<ACPAgentEvents>;
    protected client: RestfulClient<{
        runs: string;
        agents: string;
    }>;
    constructor(input: ACPAgentInput);
    protected _run(input: ACPAgentRunInput, _options: BaseAgentRunOptions, context: GetRunContext<this>): Promise<ACPAgentRunOutput>;
    checkAgentExists(): Promise<boolean>;
    get memory(): BaseMemory;
    set memory(memory: BaseMemory);
    createSnapshot(): {
        input: ACPAgentInput;
        emitter: Emitter<ACPAgentEvents>;
        isRunning: boolean;
    };
    protected convertToACPMessage(input: string | Message): any;
    protected convertToMessage(input: string | Message): any;
}

export { ACPAgent };
