import { NocoDBClient } from "../nocodb-api.js";
import { Tool } from "./database.js";
import * as fs from "fs";
import * as path from "path";

export const attachmentTools: Tool[] = [
  {
    name: "upload_attachment",
    description: "Upload a file attachment to NocoDB storage",
    inputSchema: {
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "Path to the file to upload",
        },
        storage_path: {
          type: "string",
          description: "Optional path in NocoDB storage",
        },
      },
      required: ["file_path"],
    },
    handler: async (
      client: NocoDBClient,
      args: {
        file_path: string;
        storage_path?: string;
      },
    ) => {
      // Check if file exists
      if (!fs.existsSync(args.file_path)) {
        throw new Error(`File not found: ${args.file_path}`);
      }

      const stats = fs.statSync(args.file_path);
      const fileName = path.basename(args.file_path);

      try {
        const result = await client.uploadFile(
          args.file_path,
          args.storage_path,
        );
        return {
          success: true,
          file_name: fileName,
          file_size: stats.size,
          upload_result: result,
          message: "File uploaded successfully",
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
          file_path: args.file_path,
        };
      }
    },
  },
  {
    name: "upload_attachment_by_url",
    description: "Upload files to NocoDB storage from URLs",
    inputSchema: {
      type: "object",
      properties: {
        urls: {
          type: "array",
          description: "Array of URLs to upload",
          items: {
            type: "string",
          },
        },
        storage_path: {
          type: "string",
          description: "Optional path in NocoDB storage",
        },
      },
      required: ["urls"],
    },
    handler: async (
      client: NocoDBClient,
      args: {
        urls: string[];
        storage_path?: string;
      },
    ) => {
      try {
        const result = await client.uploadByUrl(args.urls, args.storage_path);
        return {
          success: true,
          urls_count: args.urls.length,
          upload_result: result,
          message: "Files uploaded successfully from URLs",
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
          urls: args.urls,
        };
      }
    },
  },
  {
    name: "attach_file_to_record",
    description: "Attach an uploaded file to a record",
    inputSchema: {
      type: "object",
      properties: {
        base_id: {
          type: "string",
          description: "The ID of the base/project",
        },
        table_name: {
          type: "string",
          description: "The name of the table",
        },
        record_id: {
          type: "string",
          description: "The ID of the record",
        },
        attachment_field: {
          type: "string",
          description: "The name of the attachment field",
        },
        file_path: {
          type: "string",
          description: "Path to the file to upload and attach",
        },
      },
      required: [
        "base_id",
        "table_name",
        "record_id",
        "attachment_field",
        "file_path",
      ],
    },
    handler: async (
      client: NocoDBClient,
      args: {
        base_id: string;
        table_name: string;
        record_id: string;
        attachment_field: string;
        file_path: string;
      },
    ) => {
      try {
        // First upload the file
        const uploadResult = await client.uploadFile(args.file_path);

        // Get current record
        const record = await client.getRecord(
          args.base_id,
          args.table_name,
          args.record_id,
        );

        // Get existing attachments if any
        const existingAttachments = record[args.attachment_field];
        let attachments = [];

        if (existingAttachments) {
          attachments =
            typeof existingAttachments === "string"
              ? JSON.parse(existingAttachments)
              : existingAttachments;
          if (!Array.isArray(attachments)) {
            attachments = [attachments];
          }
        }

        // Add new attachment
        attachments.push(uploadResult);

        // Update record with new attachment
        await client.updateRecord(
          args.base_id,
          args.table_name,
          args.record_id,
          {
            [args.attachment_field]: attachments,
          },
        );

        return {
          success: true,
          message: "File uploaded and attached to record",
          file_name: path.basename(args.file_path),
          record_id: args.record_id,
          attachment_field: args.attachment_field,
          total_attachments: attachments.length,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
          file_path: args.file_path,
          record_id: args.record_id,
        };
      }
    },
  },
  {
    name: "get_attachment_info",
    description: "Get information about file attachments in a record",
    inputSchema: {
      type: "object",
      properties: {
        base_id: {
          type: "string",
          description: "The ID of the base/project",
        },
        table_name: {
          type: "string",
          description: "The name of the table",
        },
        record_id: {
          type: "string",
          description: "The ID of the record",
        },
        attachment_field: {
          type: "string",
          description: "The name of the attachment field",
        },
      },
      required: ["base_id", "table_name", "record_id", "attachment_field"],
    },
    handler: async (
      client: NocoDBClient,
      args: {
        base_id: string;
        table_name: string;
        record_id: string;
        attachment_field: string;
      },
    ) => {
      const record = await client.getRecord(
        args.base_id,
        args.table_name,
        args.record_id,
      );
      const attachments = record[args.attachment_field];

      if (!attachments) {
        return {
          attachments: [],
          message: "No attachments found in the specified field",
        };
      }

      // Parse attachment data if it's a JSON string
      const attachmentData =
        typeof attachments === "string" ? JSON.parse(attachments) : attachments;

      return {
        attachments: Array.isArray(attachmentData)
          ? attachmentData
          : [attachmentData],
        count: Array.isArray(attachmentData) ? attachmentData.length : 1,
        field: args.attachment_field,
        record_id: args.record_id,
      };
    },
  },
];
