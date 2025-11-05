import { Message } from '../../../backend/message.js';
import { BaseMemory } from '../../../memory/base.js';
import '../../../internals/serializable.js';
import '../../../internals/types.js';
import '../../../internals/helpers/guards.js';
import 'ai';
import '../../../errors.js';

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

interface BeeAIPlatformAgentRunInput {
    input: Message | string | Message[] | string[];
}
interface BeeAIPlatformAgentRunOutput {
    result: Message;
    event: Record<string, any>;
}
interface BeeAIPlatformAgentInput {
    url: string;
    agentName: string;
    memory: BaseMemory;
}

export type { BeeAIPlatformAgentInput, BeeAIPlatformAgentRunInput, BeeAIPlatformAgentRunOutput };
