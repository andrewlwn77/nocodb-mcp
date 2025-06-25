#!/usr/bin/env tsx
import { NocoDBClient } from '../src/nocodb-api.js';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  baseUrl: process.env.NOCODB_BASE_URL || 'http://localhost:8080',
  apiToken: process.env.NOCODB_API_TOKEN,
};

const client = new NocoDBClient(config);

async function testAttachmentFormat() {
  try {
    // Get a table with attachments
    const basesResp = await client.listBases();
    const baseId = basesResp[0].id;
    
    const tablesResp = await client.listTables(baseId);
    const table = tablesResp.find(t => t.title.includes('test_attachments'));
    
    if (table) {
      console.log('Found table:', table.title);
      
      // Try creating a record with attachment
      const uploadResult = await client.uploadByUrl([
        'https://raw.githubusercontent.com/nocodb/nocodb/develop/README.md'
      ]);
      
      console.log('Upload result:', JSON.stringify(uploadResult, null, 2));
      
      // Try different attachment formats
      console.log('\nTrying different formats...');
      
      // Format 1: Direct array
      try {
        const record1 = await client.createRecord(baseId, table.table_name, {
          title: 'Test 1 - Direct array',
          files: uploadResult,
        });
        console.log('✓ Format 1 worked:', record1.ID);
      } catch (e: any) {
        console.log('✗ Format 1 failed:', e.response?.data?.msg || e.message);
      }
      
      // Format 2: Array with url property
      try {
        const record2 = await client.createRecord(baseId, table.table_name, {
          title: 'Test 2 - URL format',
          files: uploadResult.map((f: any) => ({ url: f.signedPath || f.path })),
        });
        console.log('✓ Format 2 worked:', record2.ID);
      } catch (e: any) {
        console.log('✗ Format 2 failed:', e.response?.data?.msg || e.message);
      }
      
      // Format 3: Array with path property
      try {
        const record3 = await client.createRecord(baseId, table.table_name, {
          title: 'Test 3 - Path format',
          files: uploadResult.map((f: any) => ({ path: f.path })),
        });
        console.log('✓ Format 3 worked:', record3.ID);
      } catch (e: any) {
        console.log('✗ Format 3 failed:', e.response?.data?.msg || e.message);
      }
      
      // Check existing records
      console.log('\nChecking existing records...');
      const records = await client.listRecords(baseId, table.table_name);
      records.list.forEach((r: any) => {
        if (r.files) {
          console.log(`Record ${r.ID} files:`, JSON.stringify(r.files, null, 2));
        }
      });
      
      // Clean up
      console.log('\nCleaning up...');
      for (const record of records.list) {
        await client.deleteRecord(baseId, table.table_name, record.ID);
      }
      await client.deleteTable(table.id);
      console.log('✓ Cleanup complete');
    }
    
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

testAttachmentFormat();