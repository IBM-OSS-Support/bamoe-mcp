import { ACPAgentEvents } from '../../acp/agents/events.cjs';
import { ACPAgentInput } from '../../acp/agents/types.cjs';
import { E as Emitter } from '../../../emitter-D5Mu0EEH.cjs';
import { a as BaseAgent, B as BaseAgentRunOptions } from '../../../base-szR2Izbt.cjs';
import { GetRunContext } from '../../../context.cjs';
import { BaseMemory } from '../../../memory/base.cjs';
import { BeeAIPlatformAgentRunInput, BeeAIPlatformAgentRunOutput, BeeAIPlatformAgentInput } from './types.cjs';
import { BeeAIPlatformAgentEvents } from './events.cjs';
import { ACPAgent } from '../../acp/agents/agent.cjs';
import '../../../internals/types.cjs';
import '../../../internals/helpers/guards.cjs';
import '../../../internals/serializable.cjs';
import '../../../backend/message.cjs';
import 'ai';
import '../../../errors.cjs';
import '../../../tools/base.cjs';
import 'ajv';
import 'promise-based-task';
import '../../../cache/base.cjs';
import '../../../internals/helpers/schema.cjs';
import 'zod';
import 'zod-to-json-schema';
import '../../../internals/helpers/promise.cjs';
import '../../../internals/fetcher.cjs';
import '@ai-zen/node-fetch-event-source';
import '@ai-zen/node-fetch-event-source/lib/cjs/fetch.js';

declare class BeeAIPlatformAgent extends BaseAgent<BeeAIPlatformAgentRunInput, BeeAIPlatformAgentRunOutput> {
    protected readonly input: BeeAIPlatformAgentInput;
    readonly emitter: Emitter<BeeAIPlatformAgentEvents>;
    protected agent: ACPAgent;
    constructor(input: BeeAIPlatformAgentInput);
    protected _run(input: BeeAIPlatformAgentRunInput, _options: BaseAgentRunOptions, context: GetRunContext<this>): Promise<BeeAIPlatformAgentRunOutput>;
    checkAgentExists(): Promise<boolean>;
    get memory(): BaseMemory;
    set memory(memory: BaseMemory);
    createSnapshot(): {
        input: BeeAIPlatformAgentInput;
        agent: {
            input: ACPAgentInput;
            emitter: Emitter<ACPAgentEvents>;
            isRunning: boolean;
        };
        emitter: Emitter<BeeAIPlatformAgentEvents>;
        isRunning: boolean;
    };
}

export { BeeAIPlatformAgent };
