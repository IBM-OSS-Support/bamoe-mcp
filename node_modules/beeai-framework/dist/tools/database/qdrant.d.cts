import { BaseToolOptions, Tool, JSONToolOutput, ToolEmitter, ToolInput, BaseToolRunOptions } from '../base.cjs';
import { AnyToolSchemaLike } from '../../internals/helpers/schema.cjs';
import { QdrantClientParams, QdrantClient } from '@qdrant/js-client-rest';
import { z } from 'zod';
import 'ajv';
import '../../context.cjs';
import '../../emitter-D5Mu0EEH.cjs';
import '../../internals/types.cjs';
import '../../internals/helpers/guards.cjs';
import '../../internals/serializable.cjs';
import '../../internals/helpers/promise.cjs';
import '../../errors.cjs';
import 'promise-based-task';
import '../../cache/base.cjs';
import 'zod-to-json-schema';

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

interface QdrantToolOptions extends BaseToolOptions, QdrantClientParams {
    connection: QdrantClientParams;
}
type QdrantSearchToolResult = any;
declare enum QdrantAction {
    ListCollections = "ListCollections",
    GetCollectionInfo = "GetCollectionInfo",
    Search = "Search",
    Insert = "Insert",
    Delete = "Delete"
}
declare class QdrantDatabaseTool extends Tool<JSONToolOutput<QdrantSearchToolResult>, QdrantToolOptions> {
    name: string;
    description: string;
    inputSchema(): z.ZodObject<{
        action: z.ZodNativeEnum<typeof QdrantAction>;
        collectionName: z.ZodOptional<z.ZodString>;
        vector: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        vectors: z.ZodOptional<z.ZodArray<z.ZodArray<z.ZodNumber, "many">, "many">>;
        topK: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        filter: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        payload: z.ZodOptional<z.ZodArray<z.ZodRecord<z.ZodString, z.ZodAny>, "many">>;
        ids: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber]>, "many">>;
    }, "strip", z.ZodTypeAny, {
        action: QdrantAction;
        filter?: Record<string, any> | undefined;
        collectionName?: string | undefined;
        vector?: number[] | undefined;
        vectors?: number[][] | undefined;
        topK?: number | undefined;
        ids?: (string | number)[] | undefined;
        payload?: Record<string, any>[] | undefined;
    }, {
        action: QdrantAction;
        filter?: Record<string, any> | undefined;
        collectionName?: string | undefined;
        vector?: number[] | undefined;
        vectors?: number[][] | undefined;
        topK?: number | undefined;
        ids?: (string | number)[] | undefined;
        payload?: Record<string, any>[] | undefined;
    }>;
    readonly emitter: ToolEmitter<ToolInput<this>, JSONToolOutput<QdrantSearchToolResult>>;
    protected validateInput(schema: AnyToolSchemaLike, input: unknown): asserts input is ToolInput<this>;
    protected client(): Promise<QdrantClient>;
    protected _run(input: ToolInput<this>, _options: Partial<BaseToolRunOptions>): Promise<JSONToolOutput<any>>;
    protected listCollections(): Promise<string[]>;
    protected getCollectionInfo(collectionName: string): Promise<any>;
    protected insert(input: ToolInput<this>): Promise<any>;
    protected search(input: ToolInput<this>): Promise<any>;
    protected delete(input: ToolInput<this>): Promise<any>;
}

export { QdrantAction, QdrantDatabaseTool, type QdrantSearchToolResult, type QdrantToolOptions };
