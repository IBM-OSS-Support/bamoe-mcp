import { Message, MessageContentPart } from '../backend/message.cjs';
import { BaseMemory } from './base.cjs';
import { RequiredNested } from '../internals/types.cjs';
import '../internals/serializable.cjs';
import '../internals/helpers/guards.cjs';
import 'ai';
import '../errors.cjs';

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
