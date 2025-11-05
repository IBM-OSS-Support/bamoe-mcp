import { Serializable } from '../internals/serializable.cjs';
import { TextPart, ToolCallPart, ImagePart, FilePart, ToolResultPart } from 'ai';
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

type MessageRole = "user" | "system" | "tool" | "assistant";
type MessageContentPart = TextPart | ToolCallPart | ImagePart | FilePart | ToolResultPart;
interface MessageMeta {
    [key: string]: any;
    createdAt?: Date;
}
interface MessageInput {
    role: MessageRole;
    text: string;
    meta?: MessageMeta;
}
declare abstract class Message<T extends MessageContentPart = MessageContentPart, R extends string = MessageRole | string> extends Serializable {
    readonly meta: MessageMeta;
    abstract readonly role: R;
    readonly content: T[];
    constructor(content: T | T[] | string, meta?: MessageMeta);
    protected abstract fromString(input: string): T;
    static of({ role, text, meta }: MessageInput): Message;
    get text(): string;
    getTexts(): TextPart[];
    createSnapshot(): {
        content: T[];
        meta: MessageMeta;
        role: R;
    };
    loadSnapshot(snapshot: ReturnType<typeof this.createSnapshot>): void;
    toPlain(): {
        readonly role: R;
        readonly content: T[];
    };
    merge(other: Message<T, R>): void;
    static fromChunks<M2 extends Message>(this: new (...args: any[]) => M2, chunks: M2[]): M2;
    [Symbol.iterator](): Iterator<T>;
}
declare class AssistantMessage extends Message<TextPart | ToolCallPart> {
    readonly role = "assistant";
    getToolCalls(): ToolCallPart[];
    protected fromString(text: string): TextPart;
}
declare class ToolMessage extends Message<ToolResultPart> {
    readonly role = "tool";
    getToolResults(): ToolResultPart[];
    protected fromString(text: string): ToolResultPart;
}
declare class SystemMessage extends Message<TextPart> {
    readonly role: MessageRole;
    protected fromString(text: string): TextPart;
}
declare class UserMessage extends Message<TextPart | ImagePart | FilePart> {
    readonly role = "user";
    getImages(): ImagePart[];
    getFiles(): FilePart[];
    protected fromString(text: string): TextPart;
}
declare const Role: {
    readonly ASSISTANT: "assistant";
    readonly SYSTEM: "system";
    readonly USER: "user";
};
declare class CustomMessage extends Message<MessageContentPart, string> {
    role: string;
    constructor(role: string, content: MessageContentPart | string, meta?: MessageMeta);
    protected fromString(input: string): MessageContentPart;
}

export { AssistantMessage, CustomMessage, Message, type MessageContentPart, type MessageInput, type MessageMeta, type MessageRole, Role, SystemMessage, ToolMessage, UserMessage };
