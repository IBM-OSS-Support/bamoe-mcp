import { E as Emitter } from '../../../emitter-D5Mu0EEH.cjs';
import { a as BaseAgent, B as BaseAgentRunOptions } from '../../../base-szR2Izbt.cjs';
import { GetRunContext } from '../../../context.cjs';
import { Message } from '../../../backend/message.cjs';
import { BaseMemory } from '../../../memory/base.cjs';
import { RestfulClient } from '../../../internals/fetcher.cjs';
import { ACPAgentRunInput, ACPAgentRunOutput, ACPAgentInput } from './types.cjs';
import { ACPAgentEvents } from './events.cjs';
import '../../../internals/types.cjs';
import '../../../internals/helpers/guards.cjs';
import '../../../internals/serializable.cjs';
import '../../../errors.cjs';
import '../../../tools/base.cjs';
import 'ajv';
import 'promise-based-task';
import '../../../cache/base.cjs';
import '../../../internals/helpers/schema.cjs';
import 'zod';
import 'zod-to-json-schema';
import '../../../internals/helpers/promise.cjs';
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
