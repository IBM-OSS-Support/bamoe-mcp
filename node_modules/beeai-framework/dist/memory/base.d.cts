import { Message, MessageContentPart } from '../backend/message.cjs';
import { FrameworkError, FrameworkErrorOptions } from '../errors.cjs';
import { Serializable } from '../internals/serializable.cjs';
import 'ai';
import '../internals/types.cjs';
import '../internals/helpers/guards.cjs';

declare class MemoryError extends FrameworkError {
}
declare class MemoryFatalError extends MemoryError {
    constructor(message: string, errors?: Error[], options?: FrameworkErrorOptions);
}
declare abstract class BaseMemory<TState = unknown> extends Serializable<TState> {
    abstract get messages(): readonly Message[];
    abstract add(message: Message, index?: number): Promise<void>;
    abstract delete(message: Message): Promise<boolean>;
    abstract reset(): void;
    addMany(messages: Iterable<Message> | AsyncIterable<Message>, start?: number): Promise<void>;
    deleteMany(messages: Iterable<Message> | AsyncIterable<Message>): Promise<void>;
    splice(start: number, deleteCount: number, ...items: Message[]): Promise<Message<MessageContentPart, string>[]>;
    isEmpty(): boolean;
    asReadOnly(): ReadOnlyMemory<this>;
    [Symbol.iterator](): ArrayIterator<Message<MessageContentPart, string>>;
    abstract loadSnapshot(state: TState): void;
    abstract createSnapshot(): TState;
}
declare class ReadOnlyMemory<T extends BaseMemory = BaseMemory> extends BaseMemory<{
    source: T;
}> {
    readonly source: T;
    constructor(source: T);
    add(message: Message, index?: number): Promise<void>;
    delete(message: Message): Promise<boolean>;
    get messages(): readonly Message[];
    reset(): void;
    createSnapshot(): {
        source: T;
    };
    loadSnapshot(state: {
        source: T;
    }): void;
}

export { BaseMemory, MemoryError, MemoryFatalError, ReadOnlyMemory };
