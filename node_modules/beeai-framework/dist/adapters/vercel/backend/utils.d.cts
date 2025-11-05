import { CustomMessage, UserMessage } from '../../../backend/message.cjs';
import '../../../internals/serializable.cjs';
import '../../../internals/types.cjs';
import '../../../internals/helpers/guards.cjs';
import 'ai';

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

declare function encodeCustomMessage(msg: CustomMessage): UserMessage;
declare function decodeCustomMessage(value: string): {
    role: string;
    content: string;
} | undefined;
declare function vercelFetcher(customFetch?: typeof fetch): typeof fetch;

export { decodeCustomMessage, encodeCustomMessage, vercelFetcher };
