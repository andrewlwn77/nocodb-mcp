import axios, { AxiosInstance, AxiosError } from "axios";
import FormData from "form-data";
import * as fs from "fs";
import * as path from "path";
import {
  NocoDBConfig,
  NocoDBBase,
  NocoDBTable,
  NocoDBColumn,
  NocoDBRecord,
  NocoDBView,
  QueryOptions,
  AggregateOptions,
  BulkInsertOptions,
} from "./types.js";

export class NocoDBError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any,
  ) {
    super(message);
    this.name = "NocoDBError";
  }
}

export class NocoDBClient {
  private client: AxiosInstance;
  private config: NocoDBConfig;

  constructor(config: NocoDBConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        "Content-Type": "application/json",
        ...(config.apiToken && { "xc-token": config.apiToken }),
        ...(config.authToken && { "xc-auth": config.authToken }),
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const data = error.response?.data as any;
        const message = data?.msg || data?.message || error.message;
        throw new NocoDBError(
          message,
          error.response?.status,
          error.response?.data,
        );
      },
    );
  }

  // Base/Project operations
  async listBases(): Promise<NocoDBBase[]> {
    const response = await this.client.get("/api/v1/db/meta/projects");
    return response.data.list;
  }

  async getBase(baseId: string): Promise<NocoDBBase> {
    const response = await this.client.get(
      `/api/v1/db/meta/projects/${baseId}`,
    );
    return response.data;
  }

  // Table operations
  async listTables(baseId: string): Promise<NocoDBTable[]> {
    const response = await this.client.get(
      `/api/v1/db/meta/projects/${baseId}/tables`,
    );
    return response.data.list;
  }

  async getTable(tableId: string): Promise<NocoDBTable> {
    const response = await this.client.get(`/api/v1/db/meta/tables/${tableId}`);
    return response.data;
  }

  async createTable(
    baseId: string,
    tableName: string,
    columns: any[],
  ): Promise<NocoDBTable> {
    const response = await this.client.post(
      `/api/v1/db/meta/projects/${baseId}/tables`,
      {
        table_name: tableName,
        title: tableName,
        columns: columns,
      },
    );
    return response.data;
  }

  async deleteTable(tableId: string): Promise<void> {
    await this.client.delete(`/api/v1/db/meta/tables/${tableId}`);
  }

  // Column operations
  async listColumns(tableId: string): Promise<NocoDBColumn[]> {
    // Get columns from table info since dedicated columns endpoint doesn't exist
    const response = await this.client.get(`/api/v1/db/meta/tables/${tableId}`);
    return response.data.columns || [];
  }

  async addColumn(
    tableId: string,
    columnDefinition: any,
  ): Promise<NocoDBColumn> {
    const response = await this.client.post(
      `/api/v2/meta/tables/${tableId}/columns`,
      columnDefinition,
    );
    // The API returns the whole table object with columns,
    // so we need to find the newly added column
    const tableData = response.data;
    if (tableData.columns) {
      // Find the column that matches our title or column_name
      const newColumn = tableData.columns.find(
        (col: any) =>
          col.title === columnDefinition.title ||
          col.column_name === columnDefinition.column_name,
      );
      if (newColumn) {
        return newColumn;
      }
    }
    // Fallback to returning the whole response if we can't find the column
    return response.data;
  }

  async deleteColumn(columnId: string): Promise<void> {
    await this.client.delete(`/api/v2/meta/columns/${columnId}`);
  }

  // Record operations
  async createRecord(
    baseId: string,
    tableName: string,
    data: NocoDBRecord,
  ): Promise<NocoDBRecord> {
    // First get table ID from table name
    const tables = await this.listTables(baseId);
    const table = tables.find(
      (t) => t.table_name === tableName || t.title === tableName,
    );
    if (!table) {
      throw new NocoDBError(`Table ${tableName} not found`);
    }

    const response = await this.client.post(
      `/api/v2/tables/${table.id}/records`,
      data,
    );
    return response.data;
  }

  async bulkInsert(
    baseId: string,
    tableName: string,
    options: BulkInsertOptions,
  ): Promise<NocoDBRecord[]> {
    // First get table ID from table name
    const tables = await this.listTables(baseId);
    const table = tables.find(
      (t) => t.table_name === tableName || t.title === tableName,
    );
    if (!table) {
      throw new NocoDBError(`Table ${tableName} not found`);
    }

    const response = await this.client.post(
      `/api/v2/tables/${table.id}/records`,
      options.records,
    );
    return response.data;
  }

  async getRecord(
    baseId: string,
    tableName: string,
    recordId: string,
  ): Promise<NocoDBRecord> {
    // First get table ID from table name
    const tables = await this.listTables(baseId);
    const table = tables.find(
      (t) => t.table_name === tableName || t.title === tableName,
    );
    if (!table) {
      throw new NocoDBError(`Table ${tableName} not found`);
    }

    const response = await this.client.get(
      `/api/v2/tables/${table.id}/records/${recordId}`,
    );
    return response.data;
  }

  async listRecords(
    baseId: string,
    tableName: string,
    options?: QueryOptions,
  ): Promise<{ list: NocoDBRecord[]; pageInfo: any }> {
    // First get table ID from table name
    const tables = await this.listTables(baseId);
    const table = tables.find(
      (t) => t.table_name === tableName || t.title === tableName,
    );
    if (!table) {
      throw new NocoDBError(`Table ${tableName} not found`);
    }

    const params = new URLSearchParams();

    if (options?.where) params.append("where", options.where);
    if (options?.sort) {
      const sortStr = Array.isArray(options.sort)
        ? options.sort.join(",")
        : options.sort;
      params.append("sort", sortStr);
    }
    if (options?.fields) {
      const fieldsStr = Array.isArray(options.fields)
        ? options.fields.join(",")
        : options.fields;
      params.append("fields", fieldsStr);
    }
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.offset) params.append("offset", options.offset.toString());
    if (options?.viewId) params.append("viewId", options.viewId);

    const response = await this.client.get(
      `/api/v2/tables/${table.id}/records?${params.toString()}`,
    );
    return response.data;
  }

  async updateRecord(
    baseId: string,
    tableName: string,
    recordId: string,
    data: NocoDBRecord,
  ): Promise<NocoDBRecord> {
    // First get table ID from table name
    const tables = await this.listTables(baseId);
    const table = tables.find(
      (t) => t.table_name === tableName || t.title === tableName,
    );
    if (!table) {
      throw new NocoDBError(`Table ${tableName} not found`);
    }

    // Get the primary key field name (usually ID but can vary)
    const columns = await this.listColumns(table.id);
    const pkColumn =
      columns.find((col) => col.pk) ||
      columns.find((col) => col.title === "ID");
    const pkField = pkColumn?.title || "ID";

    const response = await this.client.patch(
      `/api/v2/tables/${table.id}/records`,
      {
        [pkField]: parseInt(recordId),
        ...data,
      },
    );
    return response.data;
  }

  async deleteRecord(
    baseId: string,
    tableName: string,
    recordId: string,
  ): Promise<void> {
    // First get table ID from table name
    const tables = await this.listTables(baseId);
    const table = tables.find(
      (t) => t.table_name === tableName || t.title === tableName,
    );
    if (!table) {
      throw new NocoDBError(`Table ${tableName} not found`);
    }

    // Get the primary key field name (usually ID but can vary)
    const columns = await this.listColumns(table.id);
    const pkColumn =
      columns.find((col) => col.pk) ||
      columns.find((col) => col.title === "ID");
    const pkField = pkColumn?.title || "ID";

    await this.client.delete(`/api/v2/tables/${table.id}/records`, {
      data: { [pkField]: parseInt(recordId) },
    });
  }

  // View operations
  async listViews(tableId: string): Promise<NocoDBView[]> {
    const response = await this.client.get(
      `/api/v2/meta/tables/${tableId}/views`,
    );
    return response.data.list || [];
  }

  async createView(
    tableId: string,
    title: string,
    type: number = 1,
  ): Promise<NocoDBView> {
    const response = await this.client.post(
      `/api/v2/meta/tables/${tableId}/views`,
      {
        title,
        type,
      },
    );
    return response.data;
  }

  // Search operation
  async searchRecords(
    baseId: string,
    tableName: string,
    query: string,
    options?: QueryOptions,
  ): Promise<{ list: NocoDBRecord[]; pageInfo: any }> {
    // For now, use regular list with client-side filtering
    // since NocoDB search syntax is complex
    const records = await this.listRecords(baseId, tableName, options);
    const filtered = records.list.filter((record) => {
      return Object.values(record).some((value) =>
        String(value).toLowerCase().includes(query.toLowerCase()),
      );
    });
    return { list: filtered, pageInfo: records.pageInfo };
  }

  // Aggregate operations
  async aggregate(
    baseId: string,
    tableName: string,
    options: AggregateOptions,
  ): Promise<number> {
    // For now, implement client-side aggregation
    // as the aggregate endpoint might not be available in all versions
    const records = await this.listRecords(baseId, tableName, {
      where: options.where,
    });

    const values = records.list.map((r) => Number(r[options.column_name]) || 0);

    switch (options.func) {
      case "count":
        return records.list.length;
      case "sum":
        return values.reduce((a, b) => a + b, 0);
      case "avg":
        return values.length > 0
          ? values.reduce((a, b) => a + b, 0) / values.length
          : 0;
      case "min":
        return Math.min(...values);
      case "max":
        return Math.max(...values);
      default:
        throw new NocoDBError(`Unknown aggregate function: ${options.func}`);
    }
  }

  // Group by operation
  async groupBy(
    baseId: string,
    tableName: string,
    columnName: string,
    options?: QueryOptions,
  ): Promise<any[]> {
    // Implement client-side grouping
    const records = await this.listRecords(baseId, tableName, options);

    const groups = new Map<any, number>();
    records.list.forEach((record) => {
      const value = record[columnName];
      groups.set(value, (groups.get(value) || 0) + 1);
    });

    const result = Array.from(groups.entries()).map(([value, count]) => ({
      [columnName]: value,
      count,
    }));

    // Apply sorting if specified
    if (options?.sort) {
      const sortField = Array.isArray(options.sort)
        ? options.sort[0]
        : options.sort;
      const desc = sortField.startsWith("-");
      result.sort((a, b) => {
        const aVal = a[columnName];
        const bVal = b[columnName];
        return desc ? (bVal > aVal ? 1 : -1) : aVal > bVal ? 1 : -1;
      });
    }

    // Apply limit and offset
    const start = options?.offset || 0;
    const end = options?.limit ? start + options.limit : undefined;

    return result.slice(start, end);
  }

  // File upload operations
  async uploadFile(filePath: string, storagePath?: string): Promise<any> {
    const formData = new FormData();
    const fileStream = fs.createReadStream(filePath);
    const fileName = path.basename(filePath);

    formData.append("file", fileStream, fileName);
    if (storagePath) {
      formData.append("path", storagePath);
    }

    const response = await this.client.post(
      "/api/v2/storage/upload",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      },
    );
    return response.data;
  }

  async uploadByUrl(urls: string[], storagePath?: string): Promise<any> {
    const urlData = urls.map((url) => ({ url }));
    const data = storagePath ? { urls: urlData, path: storagePath } : urlData;

    const response = await this.client.post(
      "/api/v2/storage/upload-by-url",
      data,
    );
    return response.data;
  }
}

