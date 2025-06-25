#!/usr/bin/env tsx
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const baseUrl = process.env.NOCODB_BASE_URL;
const apiToken = process.env.NOCODB_API_TOKEN;

async function debugRecords() {
  const client = axios.create({
    baseURL: baseUrl,
    headers: {
      'xc-token': apiToken,
    },
  });

  try {
    const basesResp = await client.get('/api/v1/db/meta/projects');
    const baseId = basesResp.data.list[0].id;
    
    const tablesResp = await client.get(`/api/v1/db/meta/projects/${baseId}/tables`);
    const table = tablesResp.data.list.find((t: any) => t.title.includes('test_mcp_table')) || tablesResp.data.list[0];
    
    console.log('Table:', table.title, table.id);
    
    // Get records  
    const records = await client.get(`/api/v2/tables/${table.id}/records`);
    console.log('\nRecords:', records.data.list);
    
    if (records.data.list.length > 0) {
      console.log('\nFirst record structure:');
      console.log(JSON.stringify(records.data.list[0], null, 2));
      
      // Try to update
      const recordId = records.data.list[0].Id;
      console.log('\nTrying to update record:', recordId);
      
      try {
        const updateResp = await client.patch(`/api/v2/tables/${table.id}/records/${recordId}`, {
          Notes: 'Updated via API test',
        });
        console.log('Update response:', updateResp.data);
      } catch (e: any) {
        console.log('Update failed:', e.response?.status, e.response?.data);
      }
      
      // Try bulk insert
      console.log('\nTrying bulk insert...');
      try {
        const bulkResp = await client.post(`/api/v2/tables/${table.id}/records`, [
          { Name: 'Test 1', Email: 'test1@example.com' },
          { Name: 'Test 2', Email: 'test2@example.com' },
        ]);
        console.log('Bulk insert response:', bulkResp.data);
      } catch (e: any) {
        console.log('Bulk insert failed:', e.response?.status, e.response?.data);
      }
      
      // Try delete
      console.log('\nTrying delete...');
      try {
        const delResp = await client.delete(`/api/v2/tables/${table.id}/records`, {
          params: { id: recordId }
        });
        console.log('Delete response:', delResp.data);
      } catch (e: any) {
        console.log('Delete failed:', e.response?.status, e.response?.data);
        
        // Try alternative delete
        try {
          const delResp2 = await client.delete(`/api/v2/tables/${table.id}/records/${recordId}`);
          console.log('Alt delete response:', delResp2.data);
        } catch (e2: any) {
          console.log('Alt delete failed:', e2.response?.status);
        }
      }
    }
    
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

debugRecords();