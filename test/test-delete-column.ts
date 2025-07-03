import axios from 'axios';
import { NocoDBClient } from '../src/nocodb-api.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testColumnDeletion() {
  const client = axios.create({
    baseURL: process.env.NOCODB_BASE_URL,
    headers: {
      'xc-token': process.env.NOCODB_API_TOKEN
    }
  });

  try {
    console.log('Testing column deletion...\n');

    // Get base ID from available bases
    const basesResp = await client.get('/api/v1/db/meta/projects');
    const bases = basesResp.data.list;
    if (bases.length === 0) {
      throw new Error('No bases found. Please create at least one base in NocoDB.');
    }
    const baseId = bases[0].id;
    const testTableName = `test_column_delete_${Date.now()}`;
    
    console.log(`Creating test table: ${testTableName}`);
    const createTableResp = await client.post(`/api/v1/db/meta/projects/${baseId}/tables`, {
      table_name: testTableName,
      title: testTableName,
      columns: [
        {
          title: 'ID',
          column_name: 'id',
          uidt: 'Number',
          pk: true,
          ai: true,
        },
        {
          title: 'Name',
          column_name: 'name',
          uidt: 'SingleLineText',
          rqd: false,
        },
        {
          title: 'ToDelete',
          column_name: 'to_delete',
          uidt: 'SingleLineText',
          rqd: false,
        }
      ]
    });
    
    const tableId = createTableResp.data.id;
    console.log(`✓ Table created with ID: ${tableId}\n`);

    // Get columns
    console.log('Getting column list...');
    const tableInfo = await client.get(`/api/v1/db/meta/tables/${tableId}`);
    const columns = tableInfo.data.columns;
    console.log(`✓ Found ${columns.length} columns:`);
    columns.forEach((col: any) => {
      console.log(`  - ${col.title} (ID: ${col.id})`);
    });

    // Find the column to delete
    const toDeleteColumn = columns.find((col: any) => col.title === 'ToDelete');
    if (!toDeleteColumn) {
      throw new Error('Column "ToDelete" not found');
    }
    console.log(`\nColumn to delete: ${toDeleteColumn.title} (ID: ${toDeleteColumn.id})`);

    // Delete the column
    console.log('\nDeleting column...');
    await client.delete(`/api/v2/meta/columns/${toDeleteColumn.id}`);
    console.log('✓ Column delete request completed');

    // Verify deletion
    console.log('\nVerifying deletion...');
    const tableInfoAfter = await client.get(`/api/v1/db/meta/tables/${tableId}`);
    const columnsAfter = tableInfoAfter.data.columns;
    console.log(`✓ Columns after deletion: ${columnsAfter.length}`);
    columnsAfter.forEach((col: any) => {
      console.log(`  - ${col.title} (ID: ${col.id})`);
    });

    const stillExists = columnsAfter.find((col: any) => col.title === 'ToDelete');
    if (stillExists) {
      console.log('✗ ERROR: Column still exists after deletion!');
    } else {
      console.log('✓ SUCCESS: Column was deleted successfully!');
    }

    // Clean up - delete the test table
    console.log('\nCleaning up...');
    await client.delete(`/api/v1/db/meta/tables/${tableId}`);
    console.log('✓ Test table deleted');

  } catch (error: any) {
    console.error('Error during test:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

// Test using the NocoDBClient class
async function testWithClient() {
  console.log('\n=== Testing with NocoDBClient class ===\n');
  
  const client = new NocoDBClient({
    baseUrl: process.env.NOCODB_BASE_URL!,
    apiToken: process.env.NOCODB_API_TOKEN
  });

  try {
    // Get base ID from available bases
    const bases = await client.listBases();
    if (bases.length === 0) {
      throw new Error('No bases found. Please create at least one base in NocoDB.');
    }
    const baseId = bases[0].id;
    const testTableName = `test_client_delete_${Date.now()}`;
    
    // Create table
    console.log(`Creating test table: ${testTableName}`);
    const table = await client.createTable(baseId, testTableName, [
      {
        title: 'ID',
        column_name: 'id',
        uidt: 'Number',
        pk: true,
        ai: true,
      },
      {
        title: 'TestColumn',
        column_name: 'test_column',
        uidt: 'SingleLineText',
      }
    ]);
    console.log(`✓ Table created with ID: ${table.id}`);

    // Add a column to delete
    console.log('\nAdding a column to delete...');
    const newColumn = await client.addColumn(table.id, {
      title: 'ColumnToDelete',
      column_name: 'column_to_delete',
      uidt: 'Number'
    });
    console.log('New column response:', JSON.stringify(newColumn, null, 2));
    console.log(`✓ Column added: ${newColumn.title || 'ColumnToDelete'} (ID: ${newColumn.id})`);

    // List columns before deletion
    const columnsBefore = await client.listColumns(table.id);
    console.log(`\nColumns before deletion: ${columnsBefore.length}`);

    // Delete the column
    console.log(`\nDeleting column ${newColumn.id}...`);
    await client.deleteColumn(newColumn.id);
    console.log('✓ Column deleted');

    // List columns after deletion
    const columnsAfter = await client.listColumns(table.id);
    console.log(`\nColumns after deletion: ${columnsAfter.length}`);
    
    if (columnsAfter.length === columnsBefore.length - 1) {
      console.log('✓ SUCCESS: Column count decreased by 1');
    } else {
      console.log('✗ ERROR: Column count did not decrease as expected');
    }

    // Clean up
    console.log('\nCleaning up...');
    await client.deleteTable(table.id);
    console.log('✓ Test table deleted');

  } catch (error: any) {
    console.error('Error during client test:', error.message);
  }
}

// Run tests
testColumnDeletion().then(() => testWithClient());