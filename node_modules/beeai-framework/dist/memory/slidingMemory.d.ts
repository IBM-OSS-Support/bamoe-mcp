import { Message, MessageContentPart } from '../backend/message.js';
import { BaseMemory } from './base.js';
import { RequiredNested } from '../internals/types.js';
import '../internals/serializable.js';
import '../internals/helpers/guards.js';
import 'ai';
import '../errors.js';

interface Handlers {
    removalSelector: (messages: Message[]) => Message | Message[];
}
interface SlidingWindowMemoryInput {
    size: number;
    handlers?: Partial<Handlers>;
}
declare class SlidingMemory extends BaseMemory {
    readonly messages: Message[];
    readonly config: RequiredNested<SlidingWindowMemoryInput>;
    constructor(config: SlidingWindowMemoryInput);
    add(message: Message, index?: number): Promise<void>;
    delete(message: Message): Promise<boolean>;
    reset(): void;
    createSnapshot(): {
        config: RequiredNested<SlidingWindowMemoryInput>;
        messages: Message<MessageContentPart, string>[];
    };
    loadSnapshot(state: ReturnType<typeof this.createSnapshot>): void;
}

export { type Handlers, SlidingMemory, type SlidingWindowMemoryInput };
