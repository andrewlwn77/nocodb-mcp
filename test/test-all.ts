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
let testRecordId: string;
const testTableName = 'test_mcp_table_' + Date.now();

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

async function testConnection() {
  log('Testing connection to NocoDB...', 'info');
  try {
    const bases = await client.listBases();
    log(`Connected successfully! Found ${bases.length} base(s)`, 'success');
    
    if (bases.length === 0) {
      throw new Error('No bases found. Please create at least one base in NocoDB.');
    }
    
    testBaseId = bases[0].id;
    log(`Using base: ${bases[0].title} (${testBaseId})`, 'info');
    
    return true;
  } catch (error: any) {
    log(`Connection failed: ${error.message}`, 'error');
    return false;
  }
}

async function testTableOperations() {
  log('\n--- Testing Table Operations ---', 'info');
  
  try {
    // List existing tables
    log('Listing tables...', 'info');
    const tables = await client.listTables(testBaseId);
    log(`Found ${tables.length} existing table(s)`, 'success');
    
    // Create a test table
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
      {
        title: 'Email',
        column_name: 'email',
        uidt: 'Email',
        unique: true,
      },
      {
        title: 'Age',
        column_name: 'age',
        uidt: 'Number',
        dt: 'int',
      },
      {
        title: 'Active',
        column_name: 'active',
        uidt: 'Checkbox',
      },
      {
        title: 'Notes',
        column_name: 'notes',
        uidt: 'LongText',
      },
      {
        title: 'Created At',
        column_name: 'created_at',
        uidt: 'DateTime',
      },
    ]);
    
    testTableId = newTable.id;
    log(`Table created successfully with ID: ${testTableId}`, 'success');
    
    // Get table info
    log('Getting table info...', 'info');
    const tableInfo = await client.getTable(testTableId);
    log(`Table info retrieved: ${tableInfo.title}`, 'success');
    
    // List columns
    log('Listing columns...', 'info');
    const columns = await client.listColumns(testTableId);
    log(`Found ${columns.length} columns`, 'success');
    columns.forEach(col => {
      log(`  - ${col.title} (${col.uidt})`, 'info');
    });
    
    return true;
  } catch (error: any) {
    log(`Table operations failed: ${error.message}`, 'error');
    return false;
  }
}

async function testRecordOperations() {
  log('\n--- Testing Record Operations ---', 'info');
  
  try {
    // Insert a single record
    log('Inserting single record...', 'info');
    const newRecord = await client.createRecord(testBaseId, testTableName, {
      Name: 'John Doe',
      Email: 'john@example.com',
      Age: 30,
      Active: true,
      Notes: 'Test record from MCP server',
      'Created At': new Date().toISOString(),
    });
    testRecordId = newRecord.ID || newRecord.Id || newRecord.id;
    log(`Record created with ID: ${testRecordId}`, 'success');
    
    // Bulk insert
    log('Bulk inserting records...', 'info');
    const bulkRecords = await client.bulkInsert(testBaseId, testTableName, {
      records: [
        {
          Name: 'Jane Smith',
          Email: 'jane@example.com',
          Age: 25,
          Active: true,
          Notes: 'Bulk record 1',
          'Created At': new Date().toISOString(),
        },
        {
          Name: 'Bob Johnson',
          Email: 'bob@example.com',
          Age: 35,
          Active: false,
          Notes: 'Bulk record 2',
          'Created At': new Date().toISOString(),
        },
        {
          Name: 'Alice Brown',
          Email: 'alice@example.com',
          Age: 28,
          Active: true,
          Notes: 'Bulk record 3',
          'Created At': new Date().toISOString(),
        },
      ],
    });
    log(`Bulk inserted ${bulkRecords.length} records`, 'success');
    
    // List records
    log('Listing all records...', 'info');
    const allRecords = await client.listRecords(testBaseId, testTableName);
    log(`Found ${allRecords.list.length} records`, 'success');
    allRecords.list.forEach(record => {
      log(`  - ${record.Name} (${record.Email})`, 'info');
    });
    
    // Get single record
    if (testRecordId) {
      log(`Getting record ${testRecordId}...`, 'info');
      const singleRecord = await client.getRecord(testBaseId, testTableName, testRecordId);
      log(`Retrieved record: ${singleRecord.Name}`, 'success');
    }
    
    // Update record
    if (testRecordId) {
      log('Updating record...', 'info');
      const updatedRecord = await client.updateRecord(testBaseId, testTableName, testRecordId, {
        Age: 31,
        Notes: 'Updated via MCP server',
      });
      log(`Record updated successfully`, 'success');
    }
    
    return true;
  } catch (error: any) {
    log(`Record operations failed: ${error.message}`, 'error');
    return false;
  }
}

async function testAdvancedQueries() {
  log('\n--- Testing Advanced Queries ---', 'info');
  
  try {
    // Query with filter
    log('Querying active users...', 'info');
    const activeUsers = await client.listRecords(testBaseId, testTableName, {
      where: '(Active,eq,true)',
      sort: '-Age',
    });
    log(`Found ${activeUsers.list.length} active users`, 'success');
    
    // Search records
    log('Searching for "John"...', 'info');
    const searchResults = await client.searchRecords(testBaseId, testTableName, 'John');
    log(`Search found ${searchResults.list.length} results`, 'success');
    
    // Aggregate - count
    log('Counting records...', 'info');
    const count = await client.aggregate(testBaseId, testTableName, {
      column_name: 'ID',
      func: 'count',
    });
    log(`Total records: ${count}`, 'success');
    
    // Aggregate - average age
    log('Calculating average age...', 'info');
    const avgAge = await client.aggregate(testBaseId, testTableName, {
      column_name: 'Age',
      func: 'avg',
    });
    log(`Average age: ${avgAge}`, 'success');
    
    // Group by
    log('Grouping by active status...', 'info');
    const groups = await client.groupBy(testBaseId, testTableName, 'Active');
    log(`Found ${groups.length} groups:`, 'success');
    groups.forEach(group => {
      log(`  - ${group.Active}: ${group.count} records`, 'info');
    });
    
    return true;
  } catch (error: any) {
    log(`Advanced queries failed: ${error.message}`, 'error');
    return false;
  }
}

async function testViewOperations() {
  log('\n--- Testing View Operations ---', 'info');
  
  try {
    // List views
    log('Listing views...', 'info');
    const views = await client.listViews(testTableId);
    log(`Found ${views.length} view(s)`, 'success');
    
    // Create a view
    log('Creating new view...', 'info');
    const newView = await client.createView(testTableId, 'Active Users View', 1);
    log(`View created: ${newView.title} (${newView.id})`, 'success');
    
    return true;
  } catch (error: any) {
    log(`View operations failed: ${error.message}`, 'error');
    return false;
  }
}

async function cleanup() {
  log('\n--- Cleaning Up ---', 'info');
  
  try {
    if (testRecordId) {
      log('Deleting test record...', 'info');
      await client.deleteRecord(testBaseId, testTableName, testRecordId);
      log('Record deleted', 'success');
    }
    
    if (testTableId) {
      log('Deleting test table...', 'info');
      await client.deleteTable(testTableId);
      log('Table deleted', 'success');
    }
    
    return true;
  } catch (error: any) {
    log(`Cleanup failed: ${error.message}`, 'error');
    return false;
  }
}

async function runAllTests() {
  log('=== NocoDB MCP Server Test Suite ===\n', 'info');
  
  const results = {
    connection: false,
    tables: false,
    records: false,
    queries: false,
    views: false,
    cleanup: false,
  };
  
  // Run tests
  results.connection = await testConnection();
  if (!results.connection) {
    log('\nConnection test failed. Cannot proceed with other tests.', 'error');
    process.exit(1);
  }
  
  results.tables = await testTableOperations();
  if (results.tables) {
    results.records = await testRecordOperations();
    results.queries = await testAdvancedQueries();
    results.views = await testViewOperations();
  }
  
  // Always try to cleanup
  results.cleanup = await cleanup();
  
  // Summary
  log('\n=== Test Summary ===', 'info');
  let passed = 0;
  let failed = 0;
  
  Object.entries(results).forEach(([test, result]) => {
    if (result) {
      log(`${test}: PASSED`, 'success');
      passed++;
    } else {
      log(`${test}: FAILED`, 'error');
      failed++;
    }
  });
  
  log(`\nTotal: ${passed} passed, ${failed} failed`, 'info');
  
  if (failed > 0) {
    log('\nSome tests failed. Please check the error messages above.', 'error');
    process.exit(1);
  } else {
    log('\nAll tests passed! The NocoDB MCP server is working correctly.', 'success');
  }
}

// Run tests
runAllTests().catch(error => {
  log(`Unexpected error: ${error.message}`, 'error');
  process.exit(1);
});