#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { NocoDBClient, NocoDBError } from './nocodb-api.js';
import { NocoDBConfig } from './types.js';
import { databaseTools } from './tools/database.js';
import { tableTools } from './tools/table.js';
import { recordTools } from './tools/record.js';
import { viewTools } from './tools/view.js';
import { queryTools } from './tools/query.js';
import { attachmentTools } from './tools/attachment.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize NocoDB client
const config: NocoDBConfig = {
  baseUrl: process.env.NOCODB_BASE_URL || 'http://localhost:8080',
  apiToken: process.env.NOCODB_API_TOKEN,
  defaultBase: process.env.NOCODB_DEFAULT_BASE,
};

if (!config.apiToken && !process.env.NOCODB_AUTH_TOKEN) {
  console.error('Error: NOCODB_API_TOKEN or NOCODB_AUTH_TOKEN must be set');
  process.exit(1);
}

if (process.env.NOCODB_AUTH_TOKEN) {
  config.authToken = process.env.NOCODB_AUTH_TOKEN;
}

const nocodb = new NocoDBClient(config);

// Create MCP server
const server = new Server(
  {
    name: 'nocodb-mcp',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Combine all tools
const allTools = [
  ...databaseTools,
  ...tableTools,
  ...recordTools,
  ...viewTools,
  ...queryTools,
  ...attachmentTools,
];

// Register handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: allTools.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  const tool = allTools.find(t => t.name === name);
  if (!tool) {
    throw new McpError(ErrorCode.MethodNotFound, `Tool ${name} not found`);
  }

  try {
    const result = await tool.handler(nocodb, args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof NocoDBError) {
      throw new McpError(
        ErrorCode.InternalError,
        `NocoDB error: ${error.message}`,
        error.details
      );
    }
    throw error;
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('NocoDB MCP server started');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});