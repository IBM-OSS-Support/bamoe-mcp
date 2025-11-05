import { PromptTemplate } from '../../template.cjs';
import { z } from 'zod';
import '../../errors.cjs';
import '../../internals/types.cjs';
import '../../internals/helpers/guards.cjs';
import '../../internals/serializable.cjs';
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

declare const ToolCallingAgentSystemPrompt: PromptTemplate<z.ZodObject<{
    role: z.ZodString;
    instructions: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    role: string;
    instructions?: string | undefined;
}, {
    role: string;
    instructions?: string | undefined;
}>>;
declare const ToolCallingAgentTaskPrompt: PromptTemplate<z.ZodObject<{
    prompt: z.ZodString;
    context: z.ZodOptional<z.ZodString>;
    expectedOutput: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    prompt: string;
    context?: string | undefined;
    expectedOutput?: string | undefined;
}, {
    prompt: string;
    context?: string | undefined;
    expectedOutput?: string | undefined;
}>>;

export { ToolCallingAgentSystemPrompt, ToolCallingAgentTaskPrompt };
