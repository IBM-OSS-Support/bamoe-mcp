import { Message, MessageContentPart } from '../backend/message.js';
import { BaseMemory } from './base.js';
import '../internals/serializable.js';
import '../internals/types.js';
import '../internals/helpers/guards.js';
import 'ai';
import '../errors.js';

declare class UnconstrainedMemory extends BaseMemory {
    messages: Message[];
    add(message: Message, index?: number): Promise<void>;
    delete(message: Message): Promise<boolean>;
    reset(): void;
    loadSnapshot(snapshot: ReturnType<typeof this.createSnapshot>): void;
    createSnapshot(): {
        messages: Message<MessageContentPart, string>[];
    };
}

export { UnconstrainedMemory };
