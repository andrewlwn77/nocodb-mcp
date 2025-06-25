export interface NocoDBConfig {
  baseUrl: string;
  apiToken?: string;
  authToken?: string;
  defaultBase?: string;
}

export interface NocoDBBase {
  id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface NocoDBTable {
  id: string;
  base_id: string;
  table_name: string;
  title: string;
  type: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface NocoDBColumn {
  id: string;
  base_id: string;
  fk_model_id: string;
  title: string;
  column_name: string;
  uidt: string; // UI Data Type
  dt: string; // Data Type
  np?: number; // Numeric Precision
  ns?: number; // Numeric Scale
  pk?: boolean; // Primary Key
  pv?: boolean; // Primary Value
  rqd?: boolean; // Required
  un?: boolean; // Unsigned
  ai?: boolean; // Auto Increment
  unique?: boolean;
  created_at: string;
  updated_at: string;
}

export interface NocoDBRecord {
  [key: string]: any;
}

export interface NocoDBView {
  id: string;
  title: string;
  type: number;
  fk_model_id: string;
  show_system_fields?: boolean;
  lock_type?: string;
  created_at: string;
  updated_at: string;
}

export interface QueryOptions {
  where?: string;
  sort?: string | string[];
  fields?: string | string[];
  limit?: number;
  offset?: number;
  viewId?: string;
}

export interface AggregateOptions {
  column_name: string;
  func: 'count' | 'sum' | 'avg' | 'min' | 'max';
  where?: string;
}

export interface BulkInsertOptions {
  records: NocoDBRecord[];
}

export interface NocoDBAttachment {
  url: string;
  title: string;
  mimetype: string;
  size: number;
  path?: string;
}