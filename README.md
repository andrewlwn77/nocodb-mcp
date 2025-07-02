# NocoDB MCP Server

A Model Context Protocol (MCP) server that provides a comprehensive interface to NocoDB - the open source Airtable alternative. This server enables AI agents to interact with NocoDB databases, making it perfect for storing and managing operational data across multiple AI teams.

## Features

- **Database Operations**: List and manage NocoDB bases/projects
- **Table Management**: Create, list, and delete tables with custom schemas
- **Column Management**: Add columns to existing tables with full type support
- **Record CRUD**: Full create, read, update, delete operations on records
- **Advanced Queries**: Filter, sort, search, and aggregate data
- **View Management**: Create and use different views (Grid, Gallery, Form, etc.)
- **Bulk Operations**: Insert multiple records at once
- **File Attachments**: Upload files locally or from URLs, attach to records

## Installation

### Via NPM (Global)

```bash
npm install -g @andrewlwn77/nocodb-mcp
```

### Via NPX (No installation)

```bash
npx @andrewlwn77/nocodb-mcp
```

## Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
# Required
NOCODB_BASE_URL=http://localhost:8080
NOCODB_API_TOKEN=your_api_token_here

# Optional
NOCODB_DEFAULT_BASE=your_default_base_id
```

### Getting Your API Token

1. Log into your NocoDB instance
2. Click on your profile icon
3. Select "API Tokens"
4. Create a new token with appropriate permissions

### MCP Configuration

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "nocodb": {
      "command": "npx",
      "args": ["@andrewlwn77/nocodb-mcp"],
      "env": {
        "NOCODB_BASE_URL": "http://localhost:8080",
        "NOCODB_API_TOKEN": "your_api_token_here"
      }
    }
  }
}
```

Or if installed globally:

```json
{
  "mcpServers": {
    "nocodb": {
      "command": "nocodb-mcp",
      "env": {
        "NOCODB_BASE_URL": "http://localhost:8080",
        "NOCODB_API_TOKEN": "your_api_token_here"
      }
    }
  }
}
```

## Available Tools

### Database Operations

- `list_bases` - List all available databases/projects
- `get_base_info` - Get detailed information about a specific base

### Table Management

- `list_tables` - List all tables in a base
- `get_table_info` - Get table schema and column information
- `create_table` - Create a new table with custom schema
- `delete_table` - Delete a table
- `add_column` - Add a new column to an existing table

### Record Operations

- `insert_record` - Insert a single record
- `bulk_insert` - Insert multiple records at once
- `get_record` - Retrieve a specific record by ID
- `list_records` - List records with filtering and pagination
- `update_record` - Update an existing record
- `delete_record` - Delete a record
- `search_records` - Full-text search across records

### Query Operations

- `query` - Advanced filtering with multiple conditions
- `aggregate` - Perform SUM, COUNT, AVG, MIN, MAX operations
- `group_by` - Group records by a column

### View Management

- `list_views` - List all views for a table
- `create_view` - Create a new view
- `get_view_data` - Get records from a specific view

### File Attachments

- `upload_attachment` - Upload a local file to NocoDB storage
- `upload_attachment_by_url` - Upload files from URLs
- `attach_file_to_record` - Upload and attach a file to a record
- `get_attachment_info` - Get attachment information from a record

## Usage Examples

### Creating a Table

```json
{
  "tool": "create_table",
  "arguments": {
    "base_id": "p_abc123",
    "table_name": "customers",
    "columns": [
      {
        "title": "Name",
        "uidt": "SingleLineText",
        "rqd": true
      },
      {
        "title": "Email",
        "uidt": "Email",
        "unique": true
      },
      {
        "title": "Revenue",
        "uidt": "Number",
        "dt": "decimal"
      },
      {
        "title": "Status",
        "uidt": "SingleSelect",
        "dtxp": "'active','inactive','pending'"
      }
    ]
  }
}
```

### Adding Columns to Existing Tables

The `add_column` tool allows you to dynamically add columns to existing tables. Here are some examples:

#### Basic Column Types

```json
{
  "tool": "add_column",
  "arguments": {
    "table_id": "table_id_here",
    "title": "Description",
    "uidt": "LongText"
  }
}
```

#### Column with Constraints

```json
{
  "tool": "add_column",
  "arguments": {
    "table_id": "table_id_here",
    "title": "Product Code",
    "uidt": "SingleLineText",
    "unique": true,
    "rqd": true
  }
}
```

#### Select Column with Options

```json
{
  "tool": "add_column",
  "arguments": {
    "table_id": "table_id_here",
    "title": "Priority",
    "uidt": "SingleSelect",
    "meta": {
      "options": [
        {"title": "Low", "color": "#059669"},
        {"title": "Medium", "color": "#d97706"},
        {"title": "High", "color": "#dc2626"},
        {"title": "Critical", "color": "#7c3aed"}
      ]
    }
  }
}
```

#### Currency Column

```json
{
  "tool": "add_column",
  "arguments": {
    "table_id": "table_id_here",
    "title": "Price",
    "uidt": "Currency",
    "meta": {
      "currency_code": "USD"
    }
  }
}
```

For more column type examples, see [Column Types Examples](examples/column-types-example.md).

### Inserting Records

```json
{
  "tool": "insert_record",
  "arguments": {
    "base_id": "p_abc123",
    "table_name": "customers",
    "data": {
      "Name": "Acme Corp",
      "Email": "contact@acme.com",
      "Revenue": 50000,
      "Status": "active"
    }
  }
}
```

### Querying with Filters

```json
{
  "tool": "query",
  "arguments": {
    "base_id": "p_abc123",
    "table_name": "customers",
    "where": "(Status,eq,active)~and(Revenue,gt,10000)",
    "sort": ["-Revenue", "Name"],
    "fields": ["Name", "Email", "Revenue"],
    "limit": 10
  }
}
```

### Aggregating Data

```json
{
  "tool": "aggregate",
  "arguments": {
    "base_id": "p_abc123",
    "table_name": "customers",
    "column_name": "Revenue",
    "function": "sum",
    "where": "(Status,eq,active)"
  }
}
```

### File Upload Examples

#### Upload a Local File

```json
{
  "tool": "upload_attachment",
  "arguments": {
    "file_path": "/path/to/document.pdf",
    "storage_path": "documents/2024"
  }
}
```

#### Upload from URL

```json
{
  "tool": "upload_attachment_by_url",
  "arguments": {
    "urls": [
      "https://example.com/image1.png",
      "https://example.com/image2.jpg"
    ],
    "storage_path": "images"
  }
}
```

#### Attach File to Record

```json
{
  "tool": "attach_file_to_record",
  "arguments": {
    "base_id": "p_abc123",
    "table_name": "products",
    "record_id": "42",
    "attachment_field": "ProductImages",
    "file_path": "/path/to/product-photo.jpg"
  }
}
```

#### Get Attachment Information

```json
{
  "tool": "get_attachment_info",
  "arguments": {
    "base_id": "p_abc123",
    "table_name": "products",
    "record_id": "42",
    "attachment_field": "ProductImages"
  }
}
```

## NocoDB Field Types

Supported UI data types (uidt) for columns:

### Basic Types
- `SingleLineText` - Short text field
- `LongText` - Multi-line text
- `Number` - Integer numeric values
- `Decimal` - Decimal numbers with precision
- `Checkbox` - Boolean true/false

### Date & Time
- `Date` - Date without time
- `DateTime` - Date with time
- `Time` - Time only
- `Duration` - Time duration

### Specialized Text
- `Email` - Email addresses with validation
- `URL` - Web links
- `PhoneNumber` - Phone numbers (note: use "PhoneNumber" not "Phone")

### Numeric Types
- `Currency` - Money values (requires `meta.currency_code`)
- `Percent` - Percentage values
- `Rating` - Star rating

### Selection Types
- `SingleSelect` - Dropdown with single selection (requires `meta.options`)
- `MultiSelect` - Multiple selections (requires `meta.options`)

### Advanced Types
- `Attachment` - File uploads
- `JSON` - JSON data storage

### Virtual/Computed Columns
- `Formula` - Calculated fields
- `Rollup` - Aggregate related records
- `Lookup` - Lookup values from related records
- `QrCode` - Generate QR codes (requires `meta.fk_qr_value_column_id`)
- `Barcode` - Generate barcodes (requires `meta.fk_barcode_value_column_id`)

### Relational
- `LinkToAnotherRecord` - Relationships between tables
- `Links` - Many-to-many relationships

### Special Parameters for Column Types

Some column types require additional parameters in the `meta` field:

- **SingleSelect/MultiSelect**: `meta.options` array with `{title, color}` objects
- **Currency**: `meta.currency_code` (e.g., "USD", "EUR")
- **QrCode**: `meta.fk_qr_value_column_id` - ID of column to encode
- **Barcode**: `meta.fk_barcode_value_column_id` - ID of column to encode, optional `meta.barcode_format`

## Filter Syntax

NocoDB uses a specific syntax for filtering:

- `(field,operator,value)` - Basic condition
- `~and` - AND operator
- `~or` - OR operator
- `~not` - NOT operator

### Operators

- `eq` - Equal to
- `neq` - Not equal to
- `gt` - Greater than
- `ge` - Greater than or equal
- `lt` - Less than
- `le` - Less than or equal
- `like` - Contains (use % for wildcards)
- `nlike` - Does not contain
- `null` - Is null
- `notnull` - Is not null

### Examples

- `(Status,eq,active)` - Status equals "active"
- `(Revenue,gt,1000)~and(Status,eq,active)` - Revenue > 1000 AND Status = "active"
- `(Name,like,%Corp%)` - Name contains "Corp"

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/your-org/nocodb-mcp.git
cd nocodb-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev
```

### Running Tests

```bash
npm test
```

## Error Handling

The server provides detailed error messages for common issues:

- Invalid API token
- Base/table not found
- Invalid column types
- Network connectivity issues
- Rate limiting

## Best Practices

1. **Use Views**: Create views for commonly accessed data subsets
2. **Batch Operations**: Use `bulk_insert` for multiple records
3. **Field Selection**: Specify only needed fields to reduce payload size
4. **Pagination**: Use limit/offset for large datasets
5. **Caching**: Consider caching frequently accessed data on the client side

## Limitations

- Some advanced NocoDB features may not be exposed through this interface
- Rate limits depend on your NocoDB instance configuration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues and feature requests, please create an issue on the GitHub repository.