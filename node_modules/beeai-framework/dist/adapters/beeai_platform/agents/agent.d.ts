import { ACPAgentEvents } from '../../acp/agents/events.js';
import { ACPAgentInput } from '../../acp/agents/types.js';
import { E as Emitter } from '../../../emitter-C3dO-s2P.js';
import { a as BaseAgent, B as BaseAgentRunOptions } from '../../../base-BOCDDBvG.js';
import { GetRunContext } from '../../../context.js';
import { BaseMemory } from '../../../memory/base.js';
import { BeeAIPlatformAgentRunInput, BeeAIPlatformAgentRunOutput, BeeAIPlatformAgentInput } from './types.js';
import { BeeAIPlatformAgentEvents } from './events.js';
import { ACPAgent } from '../../acp/agents/agent.js';
import '../../../internals/types.js';
import '../../../internals/helpers/guards.js';
import '../../../internals/serializable.js';
import '../../../backend/message.js';
import 'ai';
import '../../../errors.js';
import '../../../tools/base.js';
import 'ajv';
import 'promise-based-task';
import '../../../cache/base.js';
import '../../../internals/helpers/schema.js';
import 'zod';
import 'zod-to-json-schema';
import '../../../internals/helpers/promise.js';
import '../../../internals/fetcher.js';
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
