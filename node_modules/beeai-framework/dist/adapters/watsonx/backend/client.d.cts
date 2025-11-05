import { WatsonXAI } from '@ibm-cloud/watsonx-ai';
import { UserOptions } from 'ibm-cloud-sdk-core';
import { BackendClient } from '../../../backend/client.cjs';
import '../../../internals/serializable.cjs';
import '../../../internals/types.cjs';
import '../../../internals/helpers/guards.cjs';

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

interface WatsonxClientSettings extends Pick<UserOptions, "authenticator" | "version"> {
    spaceId?: string;
    baseUrl?: string;
    region?: string;
    projectId?: string;
    apiKey?: string;
}
declare class WatsonxClient extends BackendClient<WatsonxClientSettings, WatsonXAI> {
    constructor(settings: WatsonxClientSettings);
    get spaceId(): string | undefined;
    get projectId(): string | undefined;
    protected create(): WatsonXAI;
}

export { WatsonxClient, type WatsonxClientSettings };
