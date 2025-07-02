#!/usr/bin/env tsx
import { NocoDBClient } from '../src/nocodb-api.js';
import dotenv from 'dotenv';
import { NocoDBConfig } from '../src/types.js';

// Load environment variables
dotenv.config();

// Test configuration
const config: NocoDBConfig = {
  baseUrl: process.env.NOCODB_BASE_URL || 'http://localhost:8080',
  apiToken: process.env.NOCODB_API_TOKEN,
};

const client = new NocoDBClient(config);

// Test data
let testBaseId: string;
let testTableId: string;
const testTableName = 'test_add_column_' + Date.now();

// ANSI color codes
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

function log(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
  const prefix = {
    info: `${BLUE}[INFO]${RESET}`,
    success: `${GREEN}[SUCCESS]${RESET}`,
    error: `${RED}[ERROR]${RESET}`,
    warning: `${YELLOW}[WARNING]${RESET}`,
  };
  console.log(`${prefix[type]} ${message}`);
}

async function setup() {
  log('Setting up test environment...', 'info');
  
  try {
    // Get base
    const bases = await client.listBases();
    if (bases.length === 0) {
      throw new Error('No bases found. Please create at least one base in NocoDB.');
    }
    
    testBaseId = bases[0].id;
    log(`Using base: ${bases[0].title}`, 'info');
    
    // Create test table with minimal columns
    log(`Creating test table: ${testTableName}`, 'info');
    const newTable = await client.createTable(testBaseId, testTableName, [
      {
        title: 'ID',
        column_name: 'id',
        uidt: 'ID',
        pk: true,
        ai: true,
        rqd: true,
      },
      {
        title: 'Name',
        column_name: 'name',
        uidt: 'SingleLineText',
        rqd: true,
      },
    ]);
    
    testTableId = newTable.id;
    log(`Test table created with ID: ${testTableId}`, 'success');
    
    return true;
  } catch (error: any) {
    log(`Setup failed: ${error.message}`, 'error');
    return false;
  }
}

async function testAddBasicColumns() {
  log('\n--- Testing Basic Column Types ---', 'info');
  
  const basicColumns = [
    {
      title: 'Description',
      uidt: 'LongText',
      description: 'Long text column',
    },
    {
      title: 'Age',
      uidt: 'Number',
      dt: 'int',
      description: 'Integer number column',
    },
    {
      title: 'Salary',
      uidt: 'Decimal',
      np: 10,
      ns: 2,
      description: 'Decimal number column',
    },
    {
      title: 'Birth Date',
      uidt: 'Date',
      description: 'Date column',
    },
    {
      title: 'Created At',
      uidt: 'DateTime',
      description: 'DateTime column',
    },
    {
      title: 'Is Active',
      uidt: 'Checkbox',
      cdf: 'false',
      description: 'Boolean column with default false',
    },
    {
      title: 'Email',
      uidt: 'Email',
      unique: true,
      description: 'Email column with unique constraint',
    },
    {
      title: 'Phone',
      uidt: 'PhoneNumber',
      description: 'Phone number column',
    },
    {
      title: 'Website',
      uidt: 'URL',
      description: 'URL column',
    },
    {
      title: 'Rating',
      uidt: 'Rating',
      description: 'Rating column',
    },
  ];
  
  for (const columnDef of basicColumns) {
    try {
      log(`Adding column: ${columnDef.title} (${columnDef.uidt})`, 'info');
      const column = await client.addColumn(testTableId, columnDef);
      log(`✓ Added ${columnDef.description}: ${column.title}`, 'success');
    } catch (error: any) {
      log(`✗ Failed to add ${columnDef.title}: ${error.message}`, 'error');
    }
  }
}

async function testAddSelectColumns() {
  log('\n--- Testing Select Column Types ---', 'info');
  
  try {
    // Single Select
    log('Adding SingleSelect column with options', 'info');
    const singleSelect = await client.addColumn(testTableId, {
      title: 'Status',
      uidt: 'SingleSelect',
      meta: {
        options: [
          { title: 'Draft', color: '#6b7280' },
          { title: 'Active', color: '#10b981' },
          { title: 'Completed', color: '#3b82f6' },
          { title: 'Archived', color: '#ef4444' },
        ],
      },
    });
    log(`✓ Added SingleSelect column: ${singleSelect.title}`, 'success');
    
    // Multi Select
    log('Adding MultiSelect column with options', 'info');
    const multiSelect = await client.addColumn(testTableId, {
      title: 'Tags',
      uidt: 'MultiSelect',
      meta: {
        options: [
          { title: 'Important', color: '#ef4444' },
          { title: 'Urgent', color: '#f59e0b' },
          { title: 'Review', color: '#8b5cf6' },
          { title: 'Follow-up', color: '#06b6d4' },
        ],
      },
    });
    log(`✓ Added MultiSelect column: ${multiSelect.title}`, 'success');
    
  } catch (error: any) {
    log(`✗ Failed to add select columns: ${error.message}`, 'error');
  }
}

async function testAddAdvancedColumns() {
  log('\n--- Testing Advanced Column Types ---', 'info');
  
  const advancedColumns = [
    {
      title: 'Data',
      uidt: 'JSON',
      description: 'JSON data column',
    },
    {
      title: 'Price',
      uidt: 'Currency',
      meta: { currency_code: 'USD' },
      description: 'Currency column',
    },
    {
      title: 'Completion',
      uidt: 'Percent',
      description: 'Percentage column',
    },
    {
      title: 'Duration',
      uidt: 'Duration',
      description: 'Duration column',
    },
  ];
  
  for (const columnDef of advancedColumns) {
    try {
      log(`Adding column: ${columnDef.title} (${columnDef.uidt})`, 'info');
      const column = await client.addColumn(testTableId, columnDef);
      log(`✓ Added ${columnDef.description}: ${column.title}`, 'success');
    } catch (error: any) {
      log(`✗ Failed to add ${columnDef.title}: ${error.message}`, 'error');
    }
  }
}

async function testColumnConstraints() {
  log('\n--- Testing Column Constraints ---', 'info');
  
  try {
    // Required field
    log('Adding required field', 'info');
    const requiredCol = await client.addColumn(testTableId, {
      title: 'Required Field',
      uidt: 'SingleLineText',
      rqd: true,
    });
    log(`✓ Added required column: ${requiredCol.title}`, 'success');
    
    // Unique field
    log('Adding unique field', 'info');
    const uniqueCol = await client.addColumn(testTableId, {
      title: 'Unique Code',
      uidt: 'SingleLineText',
      unique: true,
    });
    log(`✓ Added unique column: ${uniqueCol.title}`, 'success');
    
    // Field with default value
    log('Adding field with default value', 'info');
    const defaultCol = await client.addColumn(testTableId, {
      title: 'Default Status',
      uidt: 'SingleLineText',
      cdf: 'pending',
    });
    log(`✓ Added column with default value: ${defaultCol.title}`, 'success');
    
  } catch (error: any) {
    log(`✗ Failed to add constrained columns: ${error.message}`, 'error');
  }
}

async function testErrorCases() {
  log('\n--- Testing Error Cases ---', 'info');
  
  // Test invalid column type
  try {
    log('Testing invalid column type', 'info');
    await client.addColumn(testTableId, {
      title: 'Invalid Column',
      uidt: 'InvalidType',
    });
    log('✗ Should have failed with invalid type', 'error');
  } catch (error: any) {
    log(`✓ Correctly failed with invalid type: ${error.message}`, 'success');
  }
  
  // Test duplicate column name
  try {
    log('Testing duplicate column name', 'info');
    await client.addColumn(testTableId, {
      title: 'Name', // Already exists
      uidt: 'SingleLineText',
    });
    log('✗ Should have failed with duplicate name', 'error');
  } catch (error: any) {
    log(`✓ Correctly failed with duplicate name: ${error.message}`, 'success');
  }
}

async function testVirtualColumns() {
  log('\n--- Testing Virtual Column Types (QrCode/Barcode) ---', 'info');
  
  try {
    // First, get the list of columns to find a source column
    const columns = await client.listColumns(testTableId);
    const nameColumn = columns.find(col => col.title === 'Name');
    
    if (!nameColumn) {
      log('✗ Could not find Name column to use as reference', 'error');
      return;
    }
    
    // Test QrCode column
    try {
      log('Adding QrCode column referencing Name column', 'info');
      log(`Name column ID: ${nameColumn.id}`, 'info');
      const qrColumn = await client.addColumn(testTableId, {
        title: 'Name QR Code',
        uidt: 'QrCode',
        meta: {
          fk_qr_value_column_id: nameColumn.id,
        },
      });
      log(`✓ Added QrCode column: ${qrColumn.title}`, 'success');
    } catch (error: any) {
      log(`✗ Failed to add QrCode column: ${error.message}`, 'error');
    }
    
    // Test Barcode column
    try {
      log('Adding Barcode column referencing Name column', 'info');
      const barcodeColumn = await client.addColumn(testTableId, {
        title: 'Name Barcode',
        uidt: 'Barcode',
        meta: {
          fk_barcode_value_column_id: nameColumn.id,
          barcode_format: 'CODE128',
        },
      });
      log(`✓ Added Barcode column: ${barcodeColumn.title}`, 'success');
    } catch (error: any) {
      log(`✗ Failed to add Barcode column: ${error.message}`, 'error');
    }
    
  } catch (error: any) {
    log(`✗ Failed to test virtual columns: ${error.message}`, 'error');
  }
}

async function verifyColumns() {
  log('\n--- Verifying Added Columns ---', 'info');
  
  try {
    const columns = await client.listColumns(testTableId);
    log(`Total columns in table: ${columns.length}`, 'info');
    
    const columnTypes = new Map<string, number>();
    columns.forEach(col => {
      const count = columnTypes.get(col.uidt) || 0;
      columnTypes.set(col.uidt, count + 1);
    });
    
    log('\nColumn types summary:', 'info');
    columnTypes.forEach((count, type) => {
      console.log(`  - ${type}: ${count}`);
    });
    
  } catch (error: any) {
    log(`Failed to verify columns: ${error.message}`, 'error');
  }
}

async function cleanup() {
  log('\n--- Cleaning Up ---', 'info');
  
  try {
    if (testTableId) {
      log(`Deleting test table: ${testTableName}`, 'info');
      await client.deleteTable(testTableId);
      log('Test table deleted successfully', 'success');
    }
  } catch (error: any) {
    log(`Cleanup failed: ${error.message}`, 'warning');
  }
}

async function main() {
  log('=== NocoDB Add Column Test Suite ===\n', 'info');
  
  try {
    // Setup
    const setupSuccess = await setup();
    if (!setupSuccess) {
      process.exit(1);
    }
    
    // Run tests
    await testAddBasicColumns();
    await testAddSelectColumns();
    await testAddAdvancedColumns();
    await testColumnConstraints();
    await testVirtualColumns();
    await testErrorCases();
    await verifyColumns();
    
    log('\n✓ All tests completed!', 'success');
    
  } catch (error: any) {
    log(`\nTest suite failed: ${error.message}`, 'error');
    console.error(error);
  } finally {
    // Always cleanup
    await cleanup();
  }
}

// Run tests
main();