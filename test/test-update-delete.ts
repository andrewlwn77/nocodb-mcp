#!/usr/bin/env tsx
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const baseUrl = process.env.NOCODB_BASE_URL;
const apiToken = process.env.NOCODB_API_TOKEN;

async function testUpdateDelete() {
  const client = axios.create({
    baseURL: baseUrl,
    headers: {
      'xc-token': apiToken,
    },
  });

  try {
    // Get base and table
    const basesResp = await client.get('/api/v1/db/meta/projects');
    const baseId = basesResp.data.list[0].id;
    
    const tablesResp = await client.get(`/api/v1/db/meta/projects/${baseId}/tables`);
    const table = tablesResp.data.list.find((t: any) => t.title.includes('test_mcp_table'));
    
    if (!table) {
      console.log('No test table found');
      return;
    }
    
    console.log('Using table:', table.title);
    
    // Get records
    const recordsResp = await client.get(`/api/v2/tables/${table.id}/records`);
    const records = recordsResp.data.list;
    console.log('Found', records.length, 'records');
    
    if (records.length > 0) {
      const record = records[0];
      const recordId = record.ID;
      console.log('First record ID:', recordId);
      
      // Test UPDATE - single record with ID in body
      console.log('\n=== Testing UPDATE ===');
      try {
        const updateResp = await client.patch(`/api/v2/tables/${table.id}/records`, {
          ID: recordId,
          Notes: 'Updated via PATCH with ID in body',
          Age: 99
        });
        console.log('✓ Single update works:', updateResp.data);
      } catch (e: any) {
        console.log('✗ Single update failed:', e.response?.status, e.response?.data);
      }
      
      // Test UPDATE - array format
      try {
        const updateResp = await client.patch(`/api/v2/tables/${table.id}/records`, [
          {
            ID: recordId,
            Notes: 'Updated via PATCH array format',
            Age: 100
          }
        ]);
        console.log('✓ Array update works:', updateResp.data);
      } catch (e: any) {
        console.log('✗ Array update failed:', e.response?.status, e.response?.data);
      }
      
      // Create a test record to delete
      console.log('\n=== Creating test record for deletion ===');
      const newRecord = await client.post(`/api/v2/tables/${table.id}/records`, {
        Name: 'Delete Test',
        Email: 'delete@test.com',
        Age: 1,
        Active: false,
        Notes: 'To be deleted'
      });
      const deleteId = newRecord.data.ID;
      console.log('Created record with ID:', deleteId);
      
      // Test DELETE - single format
      console.log('\n=== Testing DELETE ===');
      try {
        const deleteResp = await client.delete(`/api/v2/tables/${table.id}/records`, {
          data: { ID: deleteId }
        });
        console.log('✓ Single delete works:', deleteResp.data);
      } catch (e: any) {
        console.log('✗ Single delete failed:', e.response?.status, e.response?.data);
        
        // Try without data wrapper
        try {
          const deleteResp2 = await client.request({
            method: 'DELETE',
            url: `/api/v2/tables/${table.id}/records`,
            data: { ID: deleteId }
          });
          console.log('✓ Delete without data wrapper works:', deleteResp2.data);
        } catch (e2: any) {
          console.log('✗ Delete without data wrapper failed:', e2.response?.status, e2.response?.data);
        }
      }
      
      // Test DELETE - array format
      const newRecord2 = await client.post(`/api/v2/tables/${table.id}/records`, {
        Name: 'Delete Test 2',
        Email: 'delete2@test.com',
        Age: 2,
        Active: false,
        Notes: 'To be deleted'
      });
      const deleteId2 = newRecord2.data.ID;
      
      try {
        const deleteResp = await client.delete(`/api/v2/tables/${table.id}/records`, {
          data: [{ ID: deleteId2 }]
        });
        console.log('✓ Array delete works:', deleteResp.data);
      } catch (e: any) {
        console.log('✗ Array delete failed:', e.response?.status, e.response?.data);
      }
    }
    
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

testUpdateDelete();