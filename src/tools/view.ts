import { NocoDBClient } from '../nocodb-api.js';
import { Tool } from './database.js';

export const viewTools: Tool[] = [
  {
    name: 'list_views',
    description: 'List all views for a table',
    inputSchema: {
      type: 'object',
      properties: {
        table_id: {
          type: 'string',
          description: 'The ID of the table',
        },
      },
      required: ['table_id'],
    },
    handler: async (client: NocoDBClient, args: { table_id: string }) => {
      const views = await client.listViews(args.table_id);
      return {
        views: views.map(view => ({
          id: view.id,
          title: view.title,
          type: view.type,
          fk_model_id: view.fk_model_id,
          show_system_fields: view.show_system_fields,
          lock_type: view.lock_type,
          created_at: view.created_at,
          updated_at: view.updated_at,
        })),
        count: views.length,
      };
    },
  },
  {
    name: 'create_view',
    description: 'Create a new view for a table',
    inputSchema: {
      type: 'object',
      properties: {
        table_id: {
          type: 'string',
          description: 'The ID of the table',
        },
        title: {
          type: 'string',
          description: 'Title of the new view',
        },
        type: {
          type: 'number',
          description: 'Type of view (1=Grid, 2=Gallery, 3=Form, 4=Kanban, 5=Calendar)',
          default: 1,
        },
      },
      required: ['table_id', 'title'],
    },
    handler: async (client: NocoDBClient, args: {
      table_id: string;
      title: string;
      type?: number;
    }) => {
      const view = await client.createView(args.table_id, args.title, args.type || 1);
      return {
        view: {
          id: view.id,
          title: view.title,
          type: view.type,
          fk_model_id: view.fk_model_id,
          created_at: view.created_at,
          updated_at: view.updated_at,
        },
        message: `View '${view.title}' created successfully`,
      };
    },
  },
  {
    name: 'get_view_data',
    description: 'Get records from a specific view',
    inputSchema: {
      type: 'object',
      properties: {
        base_id: {
          type: 'string',
          description: 'The ID of the base/project',
        },
        table_name: {
          type: 'string',
          description: 'The name of the table',
        },
        view_id: {
          type: 'string',
          description: 'The ID of the view',
        },
        limit: {
          type: 'number',
          description: 'Number of records to return',
        },
        offset: {
          type: 'number',
          description: 'Number of records to skip',
        },
      },
      required: ['base_id', 'table_name', 'view_id'],
    },
    handler: async (client: NocoDBClient, args: {
      base_id: string;
      table_name: string;
      view_id: string;
      limit?: number;
      offset?: number;
    }) => {
      const result = await client.listRecords(args.base_id, args.table_name, {
        viewId: args.view_id,
        limit: args.limit,
        offset: args.offset,
      });
      return {
        records: result.list,
        pageInfo: result.pageInfo,
        count: result.list.length,
        view_id: args.view_id,
      };
    },
  },
];