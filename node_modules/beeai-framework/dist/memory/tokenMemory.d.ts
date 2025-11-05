import { Message, MessageContentPart } from '../backend/message.js';
import { BaseMemory } from './base.js';
import '../internals/serializable.js';
import '../internals/types.js';
import '../internals/helpers/guards.js';
import 'ai';
import '../errors.js';

interface Handlers {
    estimate: (messages: Message) => number;
    tokenize: (messages: Message[]) => Promise<number>;
    removalSelector: (messages: Message[]) => Message;
}
interface TokenMemoryInput {
    maxTokens?: number;
    syncThreshold?: number;
    capacityThreshold?: number;
    handlers?: Partial<Handlers>;
}
interface TokenByMessage {
    tokensCount: number;
    dirty: boolean;
}
declare class TokenMemory extends BaseMemory {
    readonly messages: Message[];
    protected threshold: number;
    protected syncThreshold: number;
    protected maxTokens: number | null;
    protected tokensByMessage: WeakMap<Message<MessageContentPart, string>, TokenByMessage>;
    readonly handlers: Handlers;
    constructor(config?: TokenMemoryInput);
    get tokensUsed(): number;
    get isDirty(): boolean;
    add(message: Message, index?: number): Promise<void>;
    delete(message: Message): Promise<boolean>;
    sync(): Promise<void>;
    reset(): void;
    stats(): {
        tokensUsed: number;
        maxTokens: number | null;
        messagesCount: number;
        isDirty: boolean;
    };
    createSnapshot(): {
        threshold: number;
        syncThreshold: number;
        messages: Message<MessageContentPart, string>[];
        handlers: Handlers;
        maxTokens: number | null;
        tokensByMessage: [Message, number][];
    };
    loadSnapshot({ tokensByMessage, ...state }: ReturnType<typeof this.createSnapshot>): void;
}

export { type Handlers, TokenMemory, type TokenMemoryInput };
