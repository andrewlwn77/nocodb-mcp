# NocoDB MCP Server - Basic Usage Examples

This document provides practical examples of using the NocoDB MCP server for common operational tasks.

## Example 1: Project Management System

### Create a Projects Table

```json
{
  "tool": "create_table",
  "arguments": {
    "base_id": "p_abc123",
    "table_name": "projects",
    "columns": [
      {
        "title": "Project Name",
        "uidt": "SingleLineText",
        "rqd": true
      },
      {
        "title": "Description",
        "uidt": "LongText"
      },
      {
        "title": "Status",
        "uidt": "SingleSelect",
        "dtxp": "'planning','active','completed','on_hold'"
      },
      {
        "title": "Start Date",
        "uidt": "Date"
      },
      {
        "title": "Due Date",
        "uidt": "Date"
      },
      {
        "title": "Budget",
        "uidt": "Currency"
      },
      {
        "title": "Team Lead",
        "uidt": "SingleLineText"
      },
      {
        "title": "Priority",
        "uidt": "Number",
        "dt": "int"
      }
    ]
  }
}
```

### Insert a Project

```json
{
  "tool": "insert_record",
  "arguments": {
    "base_id": "p_abc123",
    "table_name": "projects",
    "data": {
      "Project Name": "AI Agent Integration",
      "Description": "Integrate NocoDB with AI agent teams for data sharing",
      "Status": "active",
      "Start Date": "2024-01-15",
      "Due Date": "2024-03-30",
      "Budget": 50000,
      "Team Lead": "Alice Johnson",
      "Priority": 1
    }
  }
}
```

### Query Active Projects

```json
{
  "tool": "query",
  "arguments": {
    "base_id": "p_abc123",
    "table_name": "projects",
    "where": "(Status,eq,active)",
    "sort": ["Priority", "-Due Date"],
    "fields": ["Project Name", "Team Lead", "Due Date", "Budget"]
  }
}
```

## Example 2: Customer CRM

### Create Customers Table

```json
{
  "tool": "create_table",
  "arguments": {
    "base_id": "p_abc123",
    "table_name": "customers",
    "columns": [
      {
        "title": "Company Name",
        "uidt": "SingleLineText",
        "rqd": true
      },
      {
        "title": "Contact Email",
        "uidt": "Email",
        "unique": true
      },
      {
        "title": "Phone",
        "uidt": "PhoneNumber"
      },
      {
        "title": "Industry",
        "uidt": "SingleSelect",
        "dtxp": "'tech','finance','healthcare','retail','other'"
      },
      {
        "title": "Annual Revenue",
        "uidt": "Currency"
      },
      {
        "title": "Account Status",
        "uidt": "SingleSelect",
        "dtxp": "'prospect','active','churned'"
      },
      {
        "title": "Last Contact",
        "uidt": "DateTime"
      },
      {
        "title": "Notes",
        "uidt": "LongText"
      }
    ]
  }
}
```

### Bulk Insert Customers

```json
{
  "tool": "bulk_insert",
  "arguments": {
    "base_id": "p_abc123",
    "table_name": "customers",
    "records": [
      {
        "Company Name": "TechCorp Inc",
        "Contact Email": "contact@techcorp.com",
        "Phone": "+1-555-0100",
        "Industry": "tech",
        "Annual Revenue": 5000000,
        "Account Status": "active",
        "Last Contact": "2024-01-10T14:30:00Z"
      },
      {
        "Company Name": "HealthFirst",
        "Contact Email": "info@healthfirst.com",
        "Phone": "+1-555-0200",
        "Industry": "healthcare",
        "Annual Revenue": 3000000,
        "Account Status": "active",
        "Last Contact": "2024-01-08T10:00:00Z"
      },
      {
        "Company Name": "RetailMax",
        "Contact Email": "sales@retailmax.com",
        "Phone": "+1-555-0300",
        "Industry": "retail",
        "Annual Revenue": 8000000,
        "Account Status": "prospect",
        "Last Contact": "2024-01-05T16:45:00Z"
      }
    ]
  }
}
```

### Get Total Revenue by Industry

```json
{
  "tool": "group_by",
  "arguments": {
    "base_id": "p_abc123",
    "table_name": "customers",
    "column_name": "Industry",
    "where": "(Account Status,eq,active)"
  }
}
```

## Example 3: Task Management

### Create Tasks Table with Relations

```json
{
  "tool": "create_table",
  "arguments": {
    "base_id": "p_abc123",
    "table_name": "tasks",
    "columns": [
      {
        "title": "Task Title",
        "uidt": "SingleLineText",
        "rqd": true
      },
      {
        "title": "Description",
        "uidt": "LongText"
      },
      {
        "title": "Assigned To",
        "uidt": "SingleLineText"
      },
      {
        "title": "Due Date",
        "uidt": "Date"
      },
      {
        "title": "Priority",
        "uidt": "SingleSelect",
        "dtxp": "'low','medium','high','urgent'"
      },
      {
        "title": "Status",
        "uidt": "SingleSelect",
        "dtxp": "'todo','in_progress','review','done'"
      },
      {
        "title": "Estimated Hours",
        "uidt": "Number",
        "dt": "float"
      },
      {
        "title": "Completed",
        "uidt": "Checkbox"
      },
      {
        "title": "Attachments",
        "uidt": "Attachment"
      }
    ]
  }
}
```

### Search Tasks

```json
{
  "tool": "search_records",
  "arguments": {
    "base_id": "p_abc123",
    "table_name": "tasks",
    "query": "integration",
    "where": "(Status,neq,done)",
    "sort": "-Priority"
  }
}
```

### Update Task Status

```json
{
  "tool": "update_record",
  "arguments": {
    "base_id": "p_abc123",
    "table_name": "tasks",
    "record_id": "rec_12345",
    "data": {
      "Status": "in_progress",
      "Assigned To": "Bob Smith"
    }
  }
}
```

## Example 4: Financial Tracking

### Create Invoices Table

```json
{
  "tool": "create_table",
  "arguments": {
    "base_id": "p_abc123",
    "table_name": "invoices",
    "columns": [
      {
        "title": "Invoice Number",
        "uidt": "SingleLineText",
        "unique": true,
        "rqd": true
      },
      {
        "title": "Customer",
        "uidt": "SingleLineText",
        "rqd": true
      },
      {
        "title": "Amount",
        "uidt": "Currency",
        "rqd": true
      },
      {
        "title": "Tax",
        "uidt": "Currency"
      },
      {
        "title": "Total",
        "uidt": "Formula",
        "formula": "{Amount} + {Tax}"
      },
      {
        "title": "Issue Date",
        "uidt": "Date",
        "rqd": true
      },
      {
        "title": "Due Date",
        "uidt": "Date",
        "rqd": true
      },
      {
        "title": "Status",
        "uidt": "SingleSelect",
        "dtxp": "'draft','sent','paid','overdue','cancelled'"
      },
      {
        "title": "Payment Date",
        "uidt": "Date"
      }
    ]
  }
}
```

### Get Total Outstanding Amount

```json
{
  "tool": "aggregate",
  "arguments": {
    "base_id": "p_abc123",
    "table_name": "invoices",
    "column_name": "Total",
    "function": "sum",
    "where": "(Status,eq,sent)~or(Status,eq,overdue)"
  }
}
```

### Find Overdue Invoices

```json
{
  "tool": "query",
  "arguments": {
    "base_id": "p_abc123",
    "table_name": "invoices",
    "where": "(Status,eq,sent)~and(Due Date,lt,2024-01-15)",
    "sort": ["Due Date"],
    "fields": ["Invoice Number", "Customer", "Total", "Due Date"]
  }
}
```

## Example 5: Creating Views

### Create a View for High Priority Tasks

```json
{
  "tool": "create_view",
  "arguments": {
    "table_id": "tbl_tasks123",
    "title": "High Priority Tasks",
    "type": 1
  }
}
```

### Get Data from View

```json
{
  "tool": "get_view_data",
  "arguments": {
    "base_id": "p_abc123",
    "table_name": "tasks",
    "view_id": "vw_highpri456",
    "limit": 20
  }
}
```

## Tips for AI Teams Using NocoDB

1. **Standardize Field Names**: Use consistent naming across tables (e.g., always use "created_at", "updated_at")

2. **Use Views for Common Queries**: Instead of complex filters, create views for frequently accessed data

3. **Leverage Formulas**: Use formula fields for calculated values instead of computing in your application

4. **Implement Soft Deletes**: Add a "deleted" checkbox field instead of actually deleting records

5. **Track Changes**: Add "created_by" and "updated_by" fields to track which AI agent modified data

6. **Use Appropriate Field Types**: Choose the right field type for better data validation and UI experience

7. **Cross-Team Collaboration**: Create shared bases for data that multiple AI teams need to access