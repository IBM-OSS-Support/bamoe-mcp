import { EventStore } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { JSONRPCMessage } from '@modelcontextprotocol/sdk/types.js';

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

/**
 * Simple in-memory implementation of the EventStore interface for resumability
 * This is primarily intended for examples and testing, not for production use
 * where a persistent storage solution would be more appropriate.
 */
declare class InMemoryEventStore implements EventStore {
    private events;
    /**
     * Generates a unique event ID for a given stream ID
     */
    private generateEventId;
    /**
     * Extracts the stream ID from an event ID
     */
    private getStreamIdFromEventId;
    /**
     * Stores an event with a generated event ID
     * Implements EventStore.storeEvent
     */
    storeEvent(streamId: string, message: JSONRPCMessage): Promise<string>;
    /**
     * Replays events that occurred after a specific event ID
     * Implements EventStore.replayEventsAfter
     */
    replayEventsAfter(lastEventId: string, { send }: {
        send: (eventId: string, message: JSONRPCMessage) => Promise<void>;
    }): Promise<string>;
}

export { InMemoryEventStore };
