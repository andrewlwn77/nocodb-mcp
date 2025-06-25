import { NocoDBClient } from '../nocodb-api.js';
import { Tool } from './database.js';

export const tableTools: Tool[] = [
  {
    name: 'list_tables',
    description: 'List all tables in a base',
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
      const tables = await client.listTables(args.base_id);
      return {
        tables: tables.map(table => ({
          id: table.id,
          table_name: table.table_name,
          title: table.title,
          type: table.type,
          enabled: table.enabled,
          created_at: table.created_at,
          updated_at: table.updated_at,
        })),
        count: tables.length,
      };
    },
  },
  {
    name: 'get_table_info',
    description: 'Get detailed information about a table including its schema',
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
      const [table, columns] = await Promise.all([
        client.getTable(args.table_id),
        client.listColumns(args.table_id),
      ]);
      
      return {
        table: {
          id: table.id,
          table_name: table.table_name,
          title: table.title,
          type: table.type,
          enabled: table.enabled,
          created_at: table.created_at,
          updated_at: table.updated_at,
        },
        columns: columns.map(col => ({
          id: col.id,
          title: col.title,
          column_name: col.column_name,
          uidt: col.uidt,
          dt: col.dt,
          pk: col.pk,
          pv: col.pv,
          rqd: col.rqd,
          unique: col.unique,
          ai: col.ai,
        })),
      };
    },
  },
  {
    name: 'create_table',
    description: 'Create a new table in a base',
    inputSchema: {
      type: 'object',
      properties: {
        base_id: {
          type: 'string',
          description: 'The ID of the base/project',
        },
        table_name: {
          type: 'string',
          description: 'Name of the new table',
        },
        columns: {
          type: 'array',
          description: 'Array of column definitions',
          items: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Column display name',
              },
              column_name: {
                type: 'string',
                description: 'Column name in database',
              },
              uidt: {
                type: 'string',
                description: 'UI Data Type (e.g., SingleLineText, Number, Date, Checkbox)',
              },
              dt: {
                type: 'string',
                description: 'Database data type',
              },
              pk: {
                type: 'boolean',
                description: 'Is primary key',
              },
              rqd: {
                type: 'boolean',
                description: 'Is required field',
              },
              unique: {
                type: 'boolean',
                description: 'Is unique constraint',
              },
              ai: {
                type: 'boolean',
                description: 'Is auto increment',
              },
            },
            required: ['title', 'uidt'],
          },
        },
      },
      required: ['base_id', 'table_name', 'columns'],
    },
    handler: async (client: NocoDBClient, args: {
      base_id: string;
      table_name: string;
      columns: any[];
    }) => {
      const table = await client.createTable(args.base_id, args.table_name, args.columns);
      return {
        table: {
          id: table.id,
          table_name: table.table_name,
          title: table.title,
          type: table.type,
          enabled: table.enabled,
          created_at: table.created_at,
          updated_at: table.updated_at,
        },
        message: `Table '${table.title}' created successfully`,
      };
    },
  },
  {
    name: 'delete_table',
    description: 'Delete a table from the database',
    inputSchema: {
      type: 'object',
      properties: {
        table_id: {
          type: 'string',
          description: 'The ID of the table to delete',
        },
      },
      required: ['table_id'],
    },
    handler: async (client: NocoDBClient, args: { table_id: string }) => {
      await client.deleteTable(args.table_id);
      return {
        message: 'Table deleted successfully',
        table_id: args.table_id,
      };
    },
  },
];