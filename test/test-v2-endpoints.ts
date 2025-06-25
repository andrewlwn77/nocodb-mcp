#!/usr/bin/env tsx
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const baseUrl = process.env.NOCODB_BASE_URL;
const apiToken = process.env.NOCODB_API_TOKEN;

async function testV2Endpoints() {
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
    const table = tablesResp.data.list[0];
    const tableId = table.id;
    
    console.log('Testing v2 endpoints for table:', table.title);
    
    // Test update endpoints
    console.log('\nUpdate endpoints:');
    
    // Get a record first
    const records = await client.get(`/api/v2/tables/${tableId}/records`);
    if (records.data.list.length > 0) {
      const recordId = records.data.list[0].ID;
      console.log('Record ID:', recordId);
      
      // Try different update formats
      try {
        await client.patch(`/api/v2/tables/${tableId}/records/${recordId}`, { Notes: 'test' });
        console.log('✓ PATCH /records/{id} works');
      } catch (e: any) {
        console.log('✗ PATCH /records/{id}:', e.response?.status);
      }
      
      try {
        await client.put(`/api/v2/tables/${tableId}/records/${recordId}`, { Notes: 'test' });
        console.log('✓ PUT /records/{id} works');
      } catch (e: any) {
        console.log('✗ PUT /records/{id}:', e.response?.status);
      }
      
      try {
        await client.patch(`/api/v2/tables/${tableId}/records`, [{ ID: recordId, Notes: 'test' }]);
        console.log('✓ PATCH /records (bulk) works');
      } catch (e: any) {
        console.log('✗ PATCH /records (bulk):', e.response?.status);
      }
    }
    
    // Test view creation
    console.log('\nView creation:');
    try {
      await client.post(`/api/v2/meta/tables/${tableId}/views`, { title: 'Test View' });
      console.log('✓ POST /tables/{id}/views works');
    } catch (e: any) {
      console.log('✗ POST /tables/{id}/views:', e.response?.status);
    }
    
    try {
      await client.post(`/api/v1/db/meta/tables/${tableId}/views`, { title: 'Test View' });
      console.log('✓ POST v1 /tables/{id}/views works');
    } catch (e: any) {
      console.log('✗ POST v1 /tables/{id}/views:', e.response?.status, e.response?.data);
    }
    
    // Test delete
    console.log('\nDelete endpoints:');
    try {
      const resp = await client.request({
        method: 'DELETE',
        url: `/api/v2/tables/${tableId}/records`,
        params: { ID: 999 }
      });
      console.log('✓ DELETE with params works');
    } catch (e: any) {
      console.log('✗ DELETE with params:', e.response?.status, e.response?.data);
    }
    
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

testV2Endpoints();