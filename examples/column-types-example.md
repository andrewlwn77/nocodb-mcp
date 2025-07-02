# Column Types Examples

This document provides examples of how to create different column types using the NocoDB MCP server.

## PhoneNumber Column

PhoneNumber columns are simple text fields optimized for phone number storage:

```json
{
  "tool": "add_column",
  "arguments": {
    "table_id": "your_table_id",
    "title": "Phone",
    "uidt": "PhoneNumber"
  }
}
```

## SingleSelect Column

SingleSelect columns require options to be specified in the meta field:

```json
{
  "tool": "add_column",
  "arguments": {
    "table_id": "your_table_id",
    "title": "Status",
    "uidt": "SingleSelect",
    "meta": {
      "options": [
        {
          "title": "Active",
          "color": "#28a745"
        },
        {
          "title": "Inactive",
          "color": "#dc3545"
        },
        {
          "title": "Pending",
          "color": "#ffc107"
        }
      ]
    }
  }
}
```

## QrCode Column

QrCode columns are virtual columns that generate QR codes from another column's data:

```json
{
  "tool": "add_column",
  "arguments": {
    "table_id": "your_table_id",
    "title": "Product QR Code",
    "uidt": "QrCode",
    "meta": {
      "fk_qr_value_column_id": "column_id_containing_data_to_encode"
    }
  }
}
```

Note: You must use `fk_qr_value_column_id` for QrCode columns.

## Barcode Column

Barcode columns are virtual columns that generate barcodes from another column's data:

```json
{
  "tool": "add_column",
  "arguments": {
    "table_id": "your_table_id",
    "title": "Product Barcode",
    "uidt": "Barcode",
    "meta": {
      "fk_barcode_value_column_id": "column_id_containing_data_to_encode",
      "barcode_format": "CODE128"
    }
  }
}
```

Note: You must use `fk_barcode_value_column_id` for Barcode columns.

### Supported Barcode Formats

- CODE128 (default)
- EAN
- EAN-13
- EAN-8
- EAN-5
- EAN-2
- UPC (UPC-A)
- CODE39
- ITF-14
- MSI
- Pharmacode
- Codabar

## Creating a Table with Multiple Column Types

Here's an example of creating a complete table with various column types:

```json
{
  "tool": "create_table",
  "arguments": {
    "base_id": "your_base_id",
    "table_name": "products",
    "columns": [
      {
        "title": "ID",
        "uidt": "Number",
        "pk": true,
        "ai": true,
        "rqd": true
      },
      {
        "title": "Name",
        "uidt": "SingleLineText",
        "rqd": true
      },
      {
        "title": "SKU",
        "uidt": "SingleLineText",
        "unique": true
      },
      {
        "title": "Status",
        "uidt": "SingleSelect",
        "meta": {
          "options": [
            { "title": "In Stock", "color": "#28a745" },
            { "title": "Out of Stock", "color": "#dc3545" },
            { "title": "Discontinued", "color": "#6c757d" }
          ]
        }
      },
      {
        "title": "Contact Phone",
        "uidt": "PhoneNumber"
      }
    ]
  }
}
```

After creating the table, you can add virtual columns (QrCode/Barcode) that reference the SKU column:

```json
{
  "tool": "add_column",
  "arguments": {
    "table_id": "newly_created_table_id",
    "title": "SKU Barcode",
    "uidt": "Barcode",
    "meta": {
      "fk_column_id": "sku_column_id",
      "barcode_format": "CODE39"
    }
  }
}
```