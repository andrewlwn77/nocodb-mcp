import { NocoDBClient } from '../nocodb-api.js';
import { Tool } from './database.js';

export const recordTools: Tool[] = [
  {
    name: 'insert_record',
    description: 'Insert a single record into a table',
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
        data: {
          type: 'object',
          description: 'The record data to insert',
          additionalProperties: true,
        },
      },
      required: ['base_id', 'table_name', 'data'],
    },
    handler: async (client: NocoDBClient, args: {
      base_id: string;
      table_name: string;
      data: any;
    }) => {
      const record = await client.createRecord(args.base_id, args.table_name, args.data);
      return {
        record,
        message: 'Record inserted successfully',
      };
    },
  },
  {
    name: 'bulk_insert',
    description: 'Insert multiple records into a table',
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
        records: {
          type: 'array',
          description: 'Array of records to insert',
          items: {
            type: 'object',
            additionalProperties: true,
          },
        },
      },
      required: ['base_id', 'table_name', 'records'],
    },
    handler: async (client: NocoDBClient, args: {
      base_id: string;
      table_name: string;
      records: any[];
    }) => {
      const records = await client.bulkInsert(args.base_id, args.table_name, {
        records: args.records,
      });
      return {
        records,
        count: records.length,
        message: `${records.length} records inserted successfully`,
      };
    },
  },
  {
    name: 'get_record',
    description: 'Get a single record by ID',
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
        record_id: {
          type: 'string',
          description: 'The ID of the record',
        },
      },
      required: ['base_id', 'table_name', 'record_id'],
    },
    handler: async (client: NocoDBClient, args: {
      base_id: string;
      table_name: string;
      record_id: string;
    }) => {
      const record = await client.getRecord(args.base_id, args.table_name, args.record_id);
      return {
        record,
      };
    },
  },
  {
    name: 'list_records',
    description: 'List records from a table with optional filtering, sorting, and pagination',
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
        where: {
          type: 'string',
          description: 'Filter condition (e.g., "(status,eq,active)")',
        },
        sort: {
          type: 'string',
          description: 'Sort fields (prefix with - for descending, e.g., "-created_at")',
        },
        fields: {
          type: 'string',
          description: 'Comma-separated list of fields to return',
        },
        limit: {
          type: 'number',
          description: 'Number of records to return (default: 25)',
        },
        offset: {
          type: 'number',
          description: 'Number of records to skip',
        },
        view_id: {
          type: 'string',
          description: 'View ID to use for filtering',
        },
      },
      required: ['base_id', 'table_name'],
    },
    handler: async (client: NocoDBClient, args: {
      base_id: string;
      table_name: string;
      where?: string;
      sort?: string;
      fields?: string;
      limit?: number;
      offset?: number;
      view_id?: string;
    }) => {
      const result = await client.listRecords(args.base_id, args.table_name, {
        where: args.where,
        sort: args.sort,
        fields: args.fields,
        limit: args.limit,
        offset: args.offset,
        viewId: args.view_id,
      });
      return {
        records: result.list,
        pageInfo: result.pageInfo,
        count: result.list.length,
      };
    },
  },
  {
    name: 'update_record',
    description: 'Update a single record',
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
        record_id: {
          type: 'string',
          description: 'The ID of the record to update',
        },
        data: {
          type: 'object',
          description: 'The fields to update',
          additionalProperties: true,
        },
      },
      required: ['base_id', 'table_name', 'record_id', 'data'],
    },
    handler: async (client: NocoDBClient, args: {
      base_id: string;
      table_name: string;
      record_id: string;
      data: any;
    }) => {
      const record = await client.updateRecord(
        args.base_id,
        args.table_name,
        args.record_id,
        args.data
      );
      return {
        record,
        message: 'Record updated successfully',
      };
    },
  },
  {
    name: 'delete_record',
    description: 'Delete a single record',
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
        record_id: {
          type: 'string',
          description: 'The ID of the record to delete',
        },
      },
      required: ['base_id', 'table_name', 'record_id'],
    },
    handler: async (client: NocoDBClient, args: {
      base_id: string;
      table_name: string;
      record_id: string;
    }) => {
      await client.deleteRecord(args.base_id, args.table_name, args.record_id);
      return {
        message: 'Record deleted successfully',
        record_id: args.record_id,
      };
    },
  },
  {
    name: 'search_records',
    description: 'Search for records containing a query string',
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
        query: {
          type: 'string',
          description: 'Search query string',
        },
        where: {
          type: 'string',
          description: 'Additional filter condition',
        },
        sort: {
          type: 'string',
          description: 'Sort fields',
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
      required: ['base_id', 'table_name', 'query'],
    },
    handler: async (client: NocoDBClient, args: {
      base_id: string;
      table_name: string;
      query: string;
      where?: string;
      sort?: string;
      limit?: number;
      offset?: number;
    }) => {
      const result = await client.searchRecords(
        args.base_id,
        args.table_name,
        args.query,
        {
          where: args.where,
          sort: args.sort,
          limit: args.limit,
          offset: args.offset,
        }
      );
      return {
        records: result.list,
        pageInfo: result.pageInfo,
        count: result.list.length,
        query: args.query,
      };
    },
  },
];