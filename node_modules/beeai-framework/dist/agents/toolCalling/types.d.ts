import { BaseMemory } from '../../memory/base.js';
import { AssistantMessage } from '../../backend/message.js';
import { C as Callback } from '../../emitter-C3dO-s2P.js';
import { ToolCallingAgentSystemPrompt, ToolCallingAgentTaskPrompt } from './prompts.js';
import { ZodSchema } from 'zod';
import '../../errors.js';
import '../../internals/types.js';
import '../../internals/helpers/guards.js';
import '../../internals/serializable.js';
import 'ai';
import '../../template.js';
import 'ajv';

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

interface ToolCallingAgentRunInput {
    prompt?: string;
    context?: string;
    expectedOutput?: string | ZodSchema;
}
interface ToolCallingAgentRunOutput {
    result: AssistantMessage;
    memory: BaseMemory;
}
interface ToolCallingAgentRunState {
    result?: AssistantMessage;
    memory: BaseMemory;
    iteration: number;
}
interface ToolCallingAgentExecutionConfig {
    totalMaxRetries?: number;
    maxRetriesPerStep?: number;
    maxIterations?: number;
}
interface ToolCallingAgentRunOptions {
    signal?: AbortSignal;
    execution?: ToolCallingAgentExecutionConfig;
}
interface ToolCallingAgentCallbacks {
    start?: Callback<{
        state: ToolCallingAgentRunState;
    }>;
    success?: Callback<{
        state: ToolCallingAgentRunState;
    }>;
}
interface ToolCallingAgentTemplates {
    system: typeof ToolCallingAgentSystemPrompt;
    task: typeof ToolCallingAgentTaskPrompt;
}

export type { ToolCallingAgentCallbacks, ToolCallingAgentExecutionConfig, ToolCallingAgentRunInput, ToolCallingAgentRunOptions, ToolCallingAgentRunOutput, ToolCallingAgentRunState, ToolCallingAgentTemplates };
