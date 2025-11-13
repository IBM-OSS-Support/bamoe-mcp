import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { UnconstrainedMemory } from 'beeai-framework/memory/unconstrainedMemory';
import { OllamaChatModel } from 'beeai-framework/adapters/ollama/backend/chat';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { ReActAgent } from 'beeai-framework/agents/react/agent';
import { MCPTool } from 'beeai-framework/tools/mcp';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import express from 'express';
import path from 'path';
import 'dotenv/config';
import fs from 'fs';

const execAsync = promisify(exec);

// Set environment variables for Ollama
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'granite3.3:8b';
let OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || process.env.OLLAMA_HOST || 'http://localhost:11434';

// Ensure the base URL includes /api for Ollama
if (!OLLAMA_BASE_URL.endsWith('/api')) {
    OLLAMA_BASE_URL = OLLAMA_BASE_URL.replace(/\/$/, '') + '/api';
}

// Ensure BeeAI can read the configuration
// Set these BEFORE creating the OllamaChatModel instance
process.env.OLLAMA_MODEL = OLLAMA_MODEL;
process.env.OLLAMA_BASE_URL = OLLAMA_BASE_URL;
process.env.OLLAMA_API_KEY = 'ollama'; // BeeAI framework requires this to be set

// Ensure BAMOE environment variables are set for child processes
// This is critical because bamoe-direct-server.js runs as a child process
process.env.BAMOE_HOST = process.env.BAMOE_HOST || 'host.docker.internal';
// Note: DEPLOYMENT_ID should NOT be set here - it will be set when user selects a deployment

console.log(`Setting BAMOE environment for child processes: BAMOE_HOST=${process.env.BAMOE_HOST}`);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../ui')));

// API endpoint to fetch deployments from Kubernetes
app.get('/api/deployments', async (req, res) => {
    const namespace = process.env.K8S_NAMESPACE || 'local-kie-sandbox-dev-deployments';

    try {
        // Check if kubectl is available
        await execAsync('kubectl version --client');

        // Get all services in the namespace
        // Note: Using --insecure-skip-tls-verify for Docker compatibility with host.docker.internal
        const isDocker = process.env.IS_DOCKER === 'true' || fs.existsSync('/.dockerenv');
        const tlsFlag = isDocker ? '--insecure-skip-tls-verify' : '';
        const { stdout } = await execAsync(`kubectl get services -n ${namespace} -o json ${tlsFlag}`);
        const servicesData = JSON.parse(stdout);

        const deployments = [];

        for (const service of servicesData.items) {
            const serviceName = service.metadata.name;

            // Extract deployment ID from service name (format: dev-deployment-<ID>)
            const match = serviceName.match(/dev-deployment-(.+)/);
            if (match) {
                const deploymentId = match[1];
                const workspaceName = service.metadata.annotations?.['tools.kie.org/workspace-name'] || '(unknown)';
                const workspaceId = service.metadata.annotations?.['tools.kie.org/workspace-id'] || '';

                deployments.push({
                    workspaceName,
                    deploymentId,
                    workspaceId
                });
            }
        }

        res.json({ success: true, deployments });
    } catch (error) {
        console.error('Error fetching deployments:', error.message);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Failed to fetch deployments. Make sure kubectl is installed and configured.'
        });
    }
});

// API endpoint to switch deployment
app.post('/api/switch-deployment', async (req, res) => {
    const { deploymentId } = req.body;

    if (!deploymentId) {
        return res.status(400).json({ success: false, error: 'deploymentId is required' });
    }

    try {
        console.log(`Switching to deployment: ${deploymentId}`);

        // Update environment variable
        process.env.DEPLOYMENT_ID = deploymentId;

        // If running in Docker, dynamically deploy the MCP server
        const isDocker = process.env.IS_DOCKER === 'true' || fs.existsSync('/.dockerenv');

        if (isDocker) {
            try {
                // Stop and remove any existing MCP server container
                console.log('Stopping existing bamoe-mcp-server container...');
                try {
                    await execAsync('docker stop bamoe-mcp-server');
                    await execAsync('docker rm bamoe-mcp-server');
                    console.log('Existing container stopped and removed');
                } catch (stopError) {
                    // Container might not exist, which is fine
                    console.log('No existing container to stop:', stopError.message);
                }

                // Build the OpenAPI URL for the selected deployment
                const openApiUrl = `http://host.docker.internal/dev-deployment-${deploymentId}/docs/openapi.json`;

                // Start new MCP server container with docker run
                console.log(`Starting bamoe-mcp-server with deployment ID: ${deploymentId}`);
                const dockerRunCmd = `docker run -d \
                    --name bamoe-mcp-server \
                    --platform linux/amd64 \
                    -p 18080:8080 \
                    --network bamoe-mcp_bamoe-network \
                    -e MCP_SERVER_OPENAPI_URLS=${openApiUrl} \
                    --restart unless-stopped \
                    -it \
                    quay.io/yamer/mcp-server:latest`;

                await execAsync(dockerRunCmd);
                console.log('MCP server container started successfully');
            } catch (dockerError) {
                console.error('Docker deployment error:', dockerError.message);
                // Return error to UI
                return res.status(500).json({
                    success: false,
                    error: `Failed to deploy MCP server: ${dockerError.message}`
                });
            }
        }

        // Notify all connected WebSocket clients to reconnect
        wss.clients.forEach((client) => {
            if (client.readyState === 1) { // OPEN
                client.send(JSON.stringify({
                    event: 'deployment_switched',
                    deploymentId,
                    message: 'Deployment switched. Reconnecting...'
                }));
            }
        });

        // Trigger reload of MCP tools
        setTimeout(async () => {
            try {
                const newTools = await getAllMCPTools();
                Object.assign(globalToolsState, newTools);
                console.log('MCP tools reloaded for new deployment');
            } catch (error) {
                console.error('Error reloading MCP tools:', error.message);
            }
        }, 3000); // Wait 3 seconds for container to start

        res.json({ success: true, message: 'Deployment switched successfully', deploymentId });
    } catch (error) {
        console.error('Error switching deployment:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Sanitize tool names to be event-emitter friendly
function sanitizeToolName(name) {
    return name
        .replace(/-/g, '_')
        .replace(/[^a-zA-Z_]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
}

const getAllMCPTools = async () => {
    const serverConfigData = fs.readFileSync('./mcp-servers.json', 'utf8');
    const { mcpServers } = JSON.parse(serverConfigData);

    const serverTools = {};
    const allTools = [];
    const toolNameMapping = {};

    for (const [serverName, serverConfig] of Object.entries(mcpServers)) {
        try {
            const actualClient = new Client({ name: serverName, version: '1.0.0' }, { capabilities: {} });
            
            // All servers now use stdio transport
            const command = serverConfig.command;
            const args = serverConfig.args || [];

            console.log(`Connecting to ${serverName} MCP server...`);
            await actualClient.connect(new StdioClientTransport({
                command: command,
                args: args,
                env: {
                    ...process.env,
                    // Ensure DEPLOYMENT_ID is explicitly passed to child process
                    DEPLOYMENT_ID: process.env.DEPLOYMENT_ID,
                    BAMOE_HOST: process.env.BAMOE_HOST
                }
            }));
            
            console.log(`Connected to MCP server: ${serverName}`);
            
            // Use standard MCPTool.fromClient
            const clientTools = await MCPTool.fromClient(actualClient);
            console.log(`Loaded ${clientTools.length} tools for ${serverName}`);
            
            // Sanitize names if needed
            clientTools.forEach(tool => {
                const originalName = tool.name;
                const sanitizedName = sanitizeToolName(originalName);
                
                if (originalName !== sanitizedName) {
                    console.log(`  Tool mapped: ${originalName} -> ${sanitizedName}`);
                    toolNameMapping[sanitizedName] = originalName;
                    tool.originalName = originalName;
                    
                    try {
                        Object.defineProperty(tool, 'name', {
                            get: () => sanitizedName,
                            enumerable: true,
                            configurable: true
                        });
                    } catch (e) {
                        console.warn(`  Could not redefine name for ${originalName}`);
                    }
                } else {
                    console.log(`  - ${tool.name}`);
                }
            });
            
            serverTools[serverName] = {
                name: serverName,
                tools: clientTools.map((tool) => tool.name),
                originalTools: clientTools.map((tool) => tool.originalName || tool.name),
            };
            allTools.push(...clientTools);
        } catch (error) {
            console.error(`Failed to connect to ${serverName}:`, error.message);
            console.error(error.stack);
        }
    }

    return { serverTools, allTools, toolNameMapping };
};

// Store tools state globally so it can be updated when deployment switches
// Note: Initial load will be empty until user selects a deployment in the UI
let globalToolsState = { serverTools: {}, allTools: [], toolNameMapping: {} };

// Try to load MCP tools at startup (may fail if MCP server isn't running yet)
try {
    console.log('Attempting to load MCP tools at startup...');
    globalToolsState = await getAllMCPTools();
    console.log(`Successfully loaded ${globalToolsState.allTools.length} tools at startup`);
} catch (error) {
    console.log('MCP tools not loaded at startup (expected if MCP server not deployed yet)');
    console.log('Tools will be loaded after user selects a deployment');
}

console.log(`Initializing Ollama with model: ${OLLAMA_MODEL}, baseURL: ${OLLAMA_BASE_URL}`);

// Try passing model name as string parameter to OllamaChatModel
const llm = new OllamaChatModel(OLLAMA_MODEL);

// Set up WebSocket server
const server = app.listen(port, () => {
    console.log(`\nServer running at http://localhost:${port}`);
    if (Object.keys(globalToolsState.serverTools).length > 0) {
        console.log(`Available MCP servers: ${Object.keys(globalToolsState.serverTools).join(', ')}`);
        console.log(`Total tools loaded: ${globalToolsState.allTools.length}`);
    } else {
        console.log('No MCP tools loaded yet. Please select a deployment in the UI.');
    }
    console.log('');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('Client connected via WebSocket');

    let isProcessing = false;
    let cancelProcessing = false;
    let memory = new UnconstrainedMemory();
    let agent = new ReActAgent({
        llm,
        memory,
        tools: globalToolsState.allTools,
    });

    // Send MCP servers and their tools to client
    ws.send(JSON.stringify({
        event: 'server_tool_list',
        servers: globalToolsState.serverTools,
        toolNameMapping: globalToolsState.toolNameMapping
    }));

    // Keep-alive ping
    const keepAlive = setInterval(() => {
        if (ws.isAlive === false) {
            clearInterval(keepAlive);
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
    }, 30000);

    ws.isAlive = true;
    ws.on('pong', () => {
        ws.isAlive = true;
    });

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message.toString());
            const { query, action, toolName, serverName } = data;

            if (action === 'stop') {
                if (isProcessing) {
                    console.log('Received stop request');
                    cancelProcessing = true;
                    isProcessing = false;
                    agent = new ReActAgent({
                        llm,
                        memory,
                        tools: globalToolsState.allTools,
                    });
                    ws.send(JSON.stringify({ event: 'stopped', message: 'Processing stopped by user' }));
                }
                return;
            }

            if (action === 'new_chat') {
                console.log('Received new chat request');
                if (isProcessing) {
                    cancelProcessing = true;
                    isProcessing = false;
                    await new Promise((resolve) => setTimeout(resolve, 200));
                }
                memory = new UnconstrainedMemory();
                agent = new ReActAgent({
                    llm,
                    memory,
                    tools: globalToolsState.allTools,
                });
                ws.send(JSON.stringify({ event: 'new_chat', message: 'New chat started' }));
                return;
            }

            if (action === 'get_tools') {
                if (serverName === 'none') {
                    console.log('Sending empty tools for "None" server');
                    ws.send(JSON.stringify({ event: 'tools_for_server', tools: [] }));
                    return;
                }
                if (serverName === 'all') {
                    const allServerTools = Object.values(globalToolsState.serverTools).flatMap((server) => server.tools);
                    console.log('Sending all tools for "All Servers":', allServerTools);
                    ws.send(JSON.stringify({ event: 'tools_for_server', tools: allServerTools }));
                    return;
                }
                if (!serverName || !globalToolsState.serverTools[serverName]) {
                    console.log('Invalid server name:', serverName);
                    ws.send(JSON.stringify({ event: 'tools_for_server', tools: [], error: 'Invalid server name' }));
                    return;
                }
                console.log('Sending tools for server:', serverName, globalToolsState.serverTools[serverName].tools);
                ws.send(JSON.stringify({ event: 'tools_for_server', tools: globalToolsState.serverTools[serverName].tools }));
                return;
            }

            if (!query || typeof query !== 'string') {
                console.error('Invalid query:', query);
                ws.send(JSON.stringify({ error: 'Invalid or missing query' }));
                return;
            }

            if (isProcessing) {
                ws.send(JSON.stringify({ error: 'Another query is being processed' }));
                return;
            }

            if (!serverName) {
                console.error('No server selected');
                ws.send(JSON.stringify({ error: 'Please select a server or None' }));
                return;
            }

            console.log('Received query:', query, 'with server:', serverName || 'none', 'tool:', toolName || 'none');
            isProcessing = true;
            
            // Update agent tools based on serverName and toolName
            if (serverName === 'none') {
                agent = new ReActAgent({
                    llm,
                    memory,
                    tools: [],
                });
            } else if (serverName === 'all') {
                if (toolName && toolName !== 'none' && toolName !== 'all') {
                    const selectedTool = globalToolsState.allTools.find((tool) => tool.name === toolName);
                    if (!selectedTool) {
                        ws.send(JSON.stringify({ error: `Tool '${toolName}' not found` }));
                        isProcessing = false;
                        return;
                    }
                    agent = new ReActAgent({
                        llm,
                        memory,
                        tools: [selectedTool],
                    });
                } else {
                    agent = new ReActAgent({
                        llm,
                        memory,
                        tools: toolName === 'none' ? [] : globalToolsState.allTools,
                    });
                }
            } else if (globalToolsState.serverTools[serverName]) {
                if (toolName && toolName !== 'none' && toolName !== 'all') {
                    const selectedTool = globalToolsState.allTools.find((tool) => tool.name === toolName && globalToolsState.serverTools[serverName].tools.includes(tool.name));
                    if (!selectedTool) {
                        ws.send(JSON.stringify({ error: `Tool '${toolName}' not found for server '${serverName}'` }));
                        isProcessing = false;
                        return;
                    }
                    agent = new ReActAgent({
                        llm,
                        memory,
                        tools: [selectedTool],
                    });
                } else {
                    agent = new ReActAgent({
                        llm,
                        memory,
                        tools: toolName === 'none' ? [] : toolName === 'all' ? globalToolsState.allTools : globalToolsState.allTools.filter((tool) => globalToolsState.serverTools[serverName].tools.includes(tool.name)),
                    });
                }
            } else {
                ws.send(JSON.stringify({ error: `Invalid server '${serverName}'` }));
                isProcessing = false;
                return;
            }

            await agent.run({ prompt: query }).observe((emitter) => {
                emitter.on('update', async ({ update }) => {
                    if (cancelProcessing) {
                        emitter.emit('end');
                        return;
                    }
                    const { key, value } = update;
                    if (key && value) {
                        const markdownValue = key !== 'final_answer' ? `- **${key}**: ${value}` : value;
                        console.log('Sending update:', { key, value: markdownValue });
                        try {
                            ws.send(JSON.stringify({ key, value: markdownValue }));
                            if (key === 'final_answer') {
                                emitter.emit('end');
                            }
                        } catch (sendError) {
                            console.error('Error sending WebSocket message:', sendError);
                            ws.send(JSON.stringify({ error: 'WebSocket send error' }));
                        }
                    }
                });

                emitter.on('end', () => {
                    console.log('Processing ended');
                    isProcessing = false;
                    cancelProcessing = false;
                    ws.send(JSON.stringify({ event: 'end', message: 'Stream completed' }));
                });

                emitter.on('error', (error) => {
                    console.error('Emitter error:', error);

                    // Try to serialize the entire error object
                    try {
                        const errorJson = JSON.stringify(error, Object.getOwnPropertyNames(error), 2);
                        console.error('Full error object:', errorJson);
                    } catch (e) {
                        console.error('Could not stringify error');
                    }

                    // Log error properties
                    console.error('Error properties:', Object.getOwnPropertyNames(error));

                    // Try to access nested errors
                    if (error.error && error.error.errors && Array.isArray(error.error.errors)) {
                        console.error('Found nested errors in error.error.errors');
                        error.error.errors.forEach((err, idx) => {
                            console.error(`Nested error ${idx}:`, err);
                            try {
                                const nestedJson = JSON.stringify(err, Object.getOwnPropertyNames(err), 2);
                                console.error(`Nested error ${idx} JSON:`, nestedJson);
                            } catch (e) {
                                console.error(`Could not stringify nested error ${idx}`);
                            }
                        });
                    }
                    isProcessing = false;
                    cancelProcessing = false;
                    agent = new ReActAgent({
                        llm,
                        memory,
                        tools: globalToolsState.allTools,
                    });
                    ws.send(JSON.stringify({ error: error.message || 'Error processing query' }));
                    ws.send(JSON.stringify({ event: 'end', message: 'Stream completed' }));
                });
            });
        } catch (error) {
            console.error('Query processing error:', error);
            isProcessing = false;
            cancelProcessing = false;
            agent = new ReActAgent({
                llm,
                memory,
                tools: globalToolsState.allTools,
            });
            ws.send(JSON.stringify({ error: error.message || 'Internal server error' }));
            ws.send(JSON.stringify({ event: 'end', message: 'Stream completed' }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        isProcessing = false;
        cancelProcessing = true;
        clearInterval(keepAlive);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        isProcessing = false;
        cancelProcessing = true;
    });
});
