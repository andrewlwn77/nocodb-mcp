import { NocoDBClient } from '../nocodb-api.js';
import { z } from 'zod';

export interface Tool {
  name: string;
  description: string;
  inputSchema: any;
  handler: (client: NocoDBClient, args: any) => Promise<any>;
}

export const databaseTools: Tool[] = [
  {
    name: 'list_bases',
    description: 'List all available NocoDB bases/projects',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    handler: async (client: NocoDBClient) => {
      const bases = await client.listBases();
      return {
        bases: bases.map(base => ({
          id: base.id,
          title: base.title,
          status: base.status,
          created_at: base.created_at,
          updated_at: base.updated_at,
        })),
        count: bases.length,
      };
    },
  },
  {
    name: 'get_base_info',
    description: 'Get detailed information about a specific base/project',
    inputSchema: {
      type: 'object',
      properties: {
        base_id: {
          type: 'string',
          description: 'The ID of the base/project',
        },
      },
      required: ['base_id'],
    },
    handler: async (client: NocoDBClient, args: { base_id: string }) => {
      const base = await client.getBase(args.base_id);
      return {
        base: {
          id: base.id,
          title: base.title,
          status: base.status,
          created_at: base.created_at,
          updated_at: base.updated_at,
        },
      };
    },
  },
];