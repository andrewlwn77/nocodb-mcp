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
    description: 'Create a new table in a base with specified columns. Supports various column types including SingleSelect (with options), PhoneNumber, QrCode, and Barcode.',
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
                description: 'UI Data Type - Basic: SingleLineText, LongText, Number, Decimal, Currency, Percent | Date/Time: Date, DateTime, Duration | Boolean: Checkbox | Select: SingleSelect, MultiSelect | Advanced: Attachment, JSON, Email, PhoneNumber, URL, Rating | Virtual/Computed: Formula, Rollup, Lookup, QrCode, Barcode | Relational: Link, Links',
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
              meta: {
                type: 'object',
                description: 'Additional metadata for specific column types (e.g., options for SingleSelect/MultiSelect, reference columns for QrCode/Barcode)',
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
  {
    name: 'add_column',
    description: 'Add a new column to an existing table. For SingleSelect: provide options in meta. For QrCode/Barcode: provide reference column ID. PhoneNumber uses standard text storage.',
    inputSchema: {
      type: 'object',
      properties: {
        table_id: {
          type: 'string',
          description: 'The ID of the table to add column to',
        },
        title: {
          type: 'string',
          description: 'Display name of the column',
        },
        column_name: {
          type: 'string',
          description: 'Database column name (optional, will be generated from title if not provided)',
        },
        uidt: {
          type: 'string',
          description: 'UI Data Type - Basic: SingleLineText, LongText, Number, Decimal, Currency, Percent | Date/Time: Date, DateTime, Duration | Boolean: Checkbox | Select: SingleSelect, MultiSelect | Advanced: Attachment, JSON, Email, PhoneNumber, URL, Rating | Virtual/Computed: Formula, Rollup, Lookup, QrCode, Barcode | Relational: Link, Links',
        },
        dt: {
          type: 'string',
          description: 'Database data type (optional)',
        },
        pk: {
          type: 'boolean',
          description: 'Is primary key (default: false)',
        },
        rqd: {
          type: 'boolean',
          description: 'Is required field (default: false)',
        },
        unique: {
          type: 'boolean',
          description: 'Has unique constraint (default: false)',
        },
        ai: {
          type: 'boolean',
          description: 'Is auto increment (default: false)',
        },
        un: {
          type: 'boolean',
          description: 'Is unsigned number (default: false)',
        },
        cdf: {
          type: 'string',
          description: 'Column default value',
        },
        dtx: {
          type: 'string',
          description: 'Date format for Date/DateTime columns',
        },
        np: {
          type: 'number',
          description: 'Numeric precision (for Number/Decimal types)',
        },
        ns: {
          type: 'number',
          description: 'Numeric scale (for Decimal type)',
        },
        meta: {
          type: 'object',
          description: 'Additional metadata for specific column types',
          properties: {
            options: {
              type: 'array',
              description: 'Options for SingleSelect/MultiSelect columns',
              items: {
                type: 'object',
                properties: {
                  title: {
                    type: 'string',
                    description: 'Option label',
                  },
                  color: {
                    type: 'string',
                    description: 'Option color in hex format (e.g., #FF5733)',
                  },
                },
                required: ['title'],
              },
            },
            fk_barcode_value_column_id: {
              type: 'string',
              description: 'Required for Barcode column - ID of the column containing the value to encode',
            },
            fk_qr_value_column_id: {
              type: 'string',
              description: 'Required for QrCode column - ID of the column containing the value to encode',
            },
            barcode_format: {
              type: 'string',
              description: 'Barcode format for Barcode columns (e.g., CODE128, EAN, EAN-13, EAN-8, EAN-5, EAN-2, UPC, CODE39, ITF-14, MSI, Pharmacode, Codabar)',
            },
            currency_code: {
              type: 'string',
              description: 'Currency code for Currency columns (e.g., USD, EUR, GBP)',
            },
          },
        },
      },
      required: ['table_id', 'title', 'uidt'],
    },
    handler: async (client: NocoDBClient, args: {
      table_id: string;
      title: string;
      column_name?: string;
      uidt: string;
      dt?: string;
      pk?: boolean;
      rqd?: boolean;
      unique?: boolean;
      ai?: boolean;
      un?: boolean;
      cdf?: string;
      dtx?: string;
      np?: number;
      ns?: number;
      meta?: any;
    }) => {
      const columnDefinition: any = {
        title: args.title,
        column_name: args.column_name || args.title.toLowerCase().replace(/\s+/g, '_'),
        uidt: args.uidt,
        ...(args.dt && { dt: args.dt }),
        ...(args.pk !== undefined && { pk: args.pk }),
        ...(args.rqd !== undefined && { rqd: args.rqd }),
        ...(args.unique !== undefined && { unique: args.unique }),
        ...(args.ai !== undefined && { ai: args.ai }),
        ...(args.un !== undefined && { un: args.un }),
        ...(args.cdf !== undefined && { cdf: args.cdf }),
        ...(args.dtx && { dtx: args.dtx }),
        ...(args.np !== undefined && { np: args.np }),
        ...(args.ns !== undefined && { ns: args.ns }),
      };

      // Handle special column types that need properties at root level
      if (args.uidt === 'QrCode' && args.meta?.fk_qr_value_column_id) {
        columnDefinition.fk_qr_value_column_id = args.meta.fk_qr_value_column_id;
      } else if (args.uidt === 'Barcode' && args.meta?.fk_barcode_value_column_id) {
        columnDefinition.fk_barcode_value_column_id = args.meta.fk_barcode_value_column_id;
        if (args.meta.barcode_format) {
          columnDefinition.barcode_format = args.meta.barcode_format;
        }
      } else if (args.meta) {
        // For other column types, keep meta as is
        columnDefinition.meta = args.meta;
      }

      const column = await client.addColumn(args.table_id, columnDefinition);
      return {
        column: {
          id: column.id,
          title: column.title,
          column_name: column.column_name,
          uidt: column.uidt,
          dt: column.dt,
          pk: column.pk,
          rqd: column.rqd,
          unique: column.unique,
          ai: column.ai,
        },
        message: `Column '${column.title}' added successfully to table`,
      };
    },
  },
];