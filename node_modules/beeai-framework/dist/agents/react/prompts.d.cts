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

declare const ReActAgentSystemPrompt: PromptTemplate<z.ZodObject<{
    instructions: z.ZodDefault<z.ZodString>;
    tools: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        schema: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        name: z.ZodString;
        description: z.ZodString;
        schema: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        name: z.ZodString;
        description: z.ZodString;
        schema: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>, "many">;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    tools: z.objectOutputType<{
        name: z.ZodString;
        description: z.ZodString;
        schema: z.ZodString;
    }, z.ZodTypeAny, "passthrough">[];
    instructions: string;
    createdAt?: string | null | undefined;
}, {
    tools: z.objectInputType<{
        name: z.ZodString;
        description: z.ZodString;
        schema: z.ZodString;
    }, z.ZodTypeAny, "passthrough">[];
    instructions?: string | undefined;
    createdAt?: string | null | undefined;
}>>;
declare const ReActAgentAssistantPrompt: PromptTemplate<z.ZodObject<{
    thought: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    toolName: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    toolInput: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    toolOutput: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    finalAnswer: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    thought?: string[] | undefined;
    toolName?: string[] | undefined;
    toolInput?: string[] | undefined;
    toolOutput?: string[] | undefined;
    finalAnswer?: string[] | undefined;
}, {
    thought?: string[] | undefined;
    toolName?: string[] | undefined;
    toolInput?: string[] | undefined;
    toolOutput?: string[] | undefined;
    finalAnswer?: string[] | undefined;
}>>;
declare const ReActAgentUserPrompt: PromptTemplate<z.ZodObject<{
    input: z.ZodString;
    meta: z.ZodOptional<z.ZodObject<{
        createdAt: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        createdAt: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        createdAt: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    input: z.ZodString;
    meta: z.ZodOptional<z.ZodObject<{
        createdAt: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        createdAt: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        createdAt: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    input: z.ZodString;
    meta: z.ZodOptional<z.ZodObject<{
        createdAt: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        createdAt: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        createdAt: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
}, z.ZodTypeAny, "passthrough">>>;
declare const ReActAgentUserEmptyPrompt: PromptTemplate<z.ZodObject<{}, "passthrough", z.ZodTypeAny, z.objectOutputType<{}, z.ZodTypeAny, "passthrough">, z.objectInputType<{}, z.ZodTypeAny, "passthrough">>>;
declare const ReActAgentToolErrorPrompt: PromptTemplate<z.ZodObject<{
    reason: z.ZodString;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    reason: z.ZodString;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    reason: z.ZodString;
}, z.ZodTypeAny, "passthrough">>>;
declare const ReActAgentToolInputErrorPrompt: PromptTemplate<z.ZodObject<{
    reason: z.ZodString;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    reason: z.ZodString;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    reason: z.ZodString;
}, z.ZodTypeAny, "passthrough">>>;
declare const ReActAgentToolNoResultsPrompt: PromptTemplate<z.ZodRecord<z.ZodString, z.ZodAny>>;
declare const ReActAgentToolNotFoundPrompt: PromptTemplate<z.ZodObject<{
    tools: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        name: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        name: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>, "many">;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    tools: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        name: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        name: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>, "many">;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    tools: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        name: z.ZodString;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        name: z.ZodString;
    }, z.ZodTypeAny, "passthrough">>, "many">;
}, z.ZodTypeAny, "passthrough">>>;
declare const ReActAgentSchemaErrorPrompt: PromptTemplate<z.ZodObject<{}, "passthrough", z.ZodTypeAny, z.objectOutputType<{}, z.ZodTypeAny, "passthrough">, z.objectInputType<{}, z.ZodTypeAny, "passthrough">>>;

export { ReActAgentAssistantPrompt, ReActAgentSchemaErrorPrompt, ReActAgentSystemPrompt, ReActAgentToolErrorPrompt, ReActAgentToolInputErrorPrompt, ReActAgentToolNoResultsPrompt, ReActAgentToolNotFoundPrompt, ReActAgentUserEmptyPrompt, ReActAgentUserPrompt };
