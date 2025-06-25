#!/usr/bin/env tsx
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function testSimple() {
  const client = axios.create({
    baseURL: process.env.NOCODB_BASE_URL,
    headers: {
      'xc-token': process.env.NOCODB_API_TOKEN,
    },
  });

  try {
    // Get base
    const basesResp = await client.get('/api/v1/db/meta/projects');
    const base = basesResp.data.list[0];
    console.log('Base:', base.title);
    
    // Get tables
    const tablesResp = await client.get(`/api/v1/db/meta/projects/${base.id}/tables`);
    console.log('\nTables:');
    tablesResp.data.list.forEach((t: any) => {
      console.log(`- ${t.title} (${t.table_name})`);
    });
    
    // Find test table
    const testTable = tablesResp.data.list.find((t: any) => t.title.includes('test_mcp_table'));
    if (testTable) {
      console.log('\nTest table:', testTable.title);
      
      // Get records
      const records = await client.get(`/api/v2/tables/${testTable.id}/records`);
      console.log('Records:', records.data.list.length);
      
      if (records.data.list.length > 0) {
        const record = records.data.list[0];
        console.log('\nFirst record:');
        console.log(JSON.stringify(record, null, 2));
        
        // Try operations
        console.log('\nTrying operations...');
        
        // Update - try different approaches
        try {
          const resp = await client.patch(`/api/v1/db/data/noco/${base.id}/${testTable.id}/views/${testTable.id}/${record.ID}`, {
            Notes: 'Updated!'
          });
          console.log('✓ Update via v1 data API works');
        } catch (e: any) {
          console.log('✗ v1 update:', e.response?.status);
        }
        
        // Delete
        try {
          const resp = await client.delete(`/api/v1/db/data/noco/${base.id}/${testTable.id}/views/${testTable.id}/${record.ID}`);
          console.log('✓ Delete via v1 data API works');
        } catch (e: any) {
          console.log('✗ v1 delete:', e.response?.status);
        }
      }
    }
    
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

testSimple();