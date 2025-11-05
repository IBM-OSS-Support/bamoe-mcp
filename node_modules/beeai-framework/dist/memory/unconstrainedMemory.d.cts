import { Message, MessageContentPart } from '../backend/message.cjs';
import { BaseMemory } from './base.cjs';
import '../internals/serializable.cjs';
import '../internals/types.cjs';
import '../internals/helpers/guards.cjs';
import 'ai';
import '../errors.cjs';

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
