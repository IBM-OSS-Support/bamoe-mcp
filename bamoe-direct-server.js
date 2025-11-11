import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Use environment variable - deployment ID must be set
const DEPLOYMENT_ID = process.env.DEPLOYMENT_ID;
const BAMOE_HOST = process.env.BAMOE_HOST || process.env.BAMOE_DEPLOYMENT_HOST || 'host.docker.internal';

if (!DEPLOYMENT_ID) {
    console.error('[BAMOE] ERROR: DEPLOYMENT_ID environment variable is not set');
    process.exit(1);
}

const BAMOE_BASE_URL = process.env.BAMOE_BASE_URL || `http://${BAMOE_HOST}/dev-deployment-${DEPLOYMENT_ID}`;

console.error(`[BAMOE] Configuration: DEPLOYMENT_ID=${DEPLOYMENT_ID}, BAMOE_HOST=${BAMOE_HOST}, BAMOE_BASE_URL=${BAMOE_BASE_URL}`);

const server = new Server(
  {
    name: 'bamoe-direct',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define all BAMOE tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'execute_dev_deployment_qx_gh_DMN_model',
        description: 'Execute the fraud detection DMN model to determine if a transaction should be flagged',
        inputSchema: {
          type: 'object',
          properties: {
            transactionAmount: {
              type: 'number',
              description: 'The transaction amount'
            },
            isKnownDevice: {
              type: 'boolean',
              description: 'Whether the transaction is from a known device'
            },
            transactionLocation: {
              type: 'string',
              description: 'The location of the transaction'
            },
            accountStatus: {
              type: 'string',
              description: 'The status of the account (e.g., active, suspended)'
            }
          },
          required: ['transactionAmount', 'isKnownDevice', 'transactionLocation', 'accountStatus']
        }
      },
      {
        name: 'fetching_dev_deployment_qx_gh_BPMN_process_workflow_instance',
        description: 'Fetch a BPMN process workflow instance by ID',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The workflow instance ID'
            }
          },
          required: ['id']
        }
      },
      {
        name: 'update_dev_deployment_qx_gh_BPMN_process_workflow_model',
        description: 'Update a BPMN process workflow model',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The workflow model ID'
            },
            data: {
              type: 'object',
              description: 'The workflow data to update'
            }
          },
          required: ['id']
        }
      },
      {
        name: 'delete_dev_deployment_qx_gh_BPMN_process_workflow_model',
        description: 'Delete a BPMN process workflow model',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The workflow model ID to delete'
            }
          },
          required: ['id']
        }
      }
    ]
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  console.error(`[BAMOE] Executing tool: ${request.params.name}`);
  console.error(`[BAMOE] Arguments:`, JSON.stringify(request.params.arguments, null, 2));
  
  try {
    if (request.params.name === 'execute_dev_deployment_qx_gh_DMN_model') {
      const { transactionAmount, isKnownDevice, transactionLocation, accountStatus } = request.params.arguments;
      
      const url = `${BAMOE_BASE_URL}/DMN_85B532DA-3AEF-4716-A502-633D8178F974/dmnresult`;
      console.error(`[BAMOE] Calling: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionAmount, isKnownDevice, transactionLocation, accountStatus })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.error(`[BAMOE] Result:`, JSON.stringify(result, null, 2));
      
      const fraudRisk = result.dmnContext?.fraudRisk || result.decisionResults?.[0]?.result || 'Unknown';
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ fraudRisk, details: result.dmnContext || result }, null, 2)
        }]
      };
    }
    
    if (request.params.name === 'fetching_dev_deployment_qx_gh_BPMN_process_workflow_instance') {
      const { id } = request.params.arguments;
      const url = `${BAMOE_BASE_URL}/FraudEvaluation/${id}`;
      console.error(`[BAMOE] Calling: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.error(`[BAMOE] Result:`, JSON.stringify(result, null, 2));
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }]
      };
    }
    
    if (request.params.name === 'update_dev_deployment_qx_gh_BPMN_process_workflow_model') {
      const { id, data } = request.params.arguments;
      const url = `${BAMOE_BASE_URL}/FraudEvaluation/${id}`;
      console.error(`[BAMOE] Calling: ${url}`);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data || {})
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.error(`[BAMOE] Result:`, JSON.stringify(result, null, 2));
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }]
      };
    }
    
    if (request.params.name === 'delete_dev_deployment_qx_gh_BPMN_process_workflow_model') {
      const { id } = request.params.arguments;
      const url = `${BAMOE_BASE_URL}/FraudEvaluation/${id}`;
      console.error(`[BAMOE] Calling: ${url}`);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.text();
      console.error(`[BAMOE] Result:`, result);
      
      return {
        content: [{
          type: 'text',
          text: result || 'Deleted successfully'
        }]
      };
    }

    throw new Error(`Unknown tool: ${request.params.name}`);
  } catch (error) {
    console.error(`[BAMOE] Error:`, error.message);
    return {
      content: [{
        type: 'text',
        text: `Error executing ${request.params.name}: ${error.message}`
      }],
      isError: true
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('BAMOE Direct MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});