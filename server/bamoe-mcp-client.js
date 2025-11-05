import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

export async function createBamoeClient() {
    const client = new Client(
        { name: 'bamoe-client', version: '1.0.0' },
        { capabilities: {} }
    );
    
    const transport = new SSEClientTransport(
        new URL('http://localhost:18080/mcp/sse')
    );
    
    await client.connect(transport);
    return client;
}
