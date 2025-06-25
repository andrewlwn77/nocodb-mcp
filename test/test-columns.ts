#!/usr/bin/env tsx
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const baseUrl = process.env.NOCODB_BASE_URL;
const apiToken = process.env.NOCODB_API_TOKEN;

async function testColumns() {
  const client = axios.create({
    baseURL: baseUrl,
    headers: {
      'xc-token': apiToken,
    },
  });

  try {
    // Get bases
    const basesResp = await client.get('/api/v1/db/meta/projects');
    const baseId = basesResp.data.list[0].id;
    console.log('Base ID:', baseId);
    
    // Get tables
    const tablesResp = await client.get(`/api/v1/db/meta/projects/${baseId}/tables`);
    const tableId = tablesResp.data.list[0].id;
    console.log('Table ID:', tableId);
    console.log('Table Name:', tablesResp.data.list[0].table_name);
    
    // Try different column endpoints
    console.log('\nTrying column endpoints...');
    
    // v1 with tables
    try {
      const resp = await client.get(`/api/v1/db/meta/tables/${tableId}/columns`);
      console.log('✓ v1 /tables/{id}/columns works');
    } catch (e: any) {
      console.log('✗ v1 /tables/{id}/columns:', e.response?.status, e.response?.data?.msg);
    }
    
    // v2 with tables
    try {
      const resp = await client.get(`/api/v2/meta/tables/${tableId}/columns`);
      console.log('✓ v2 /tables/{id}/columns works:', resp.data);
    } catch (e: any) {
      console.log('✗ v2 /tables/{id}/columns:', e.response?.status, e.response?.data?.msg);
    }
    
    // Get table info with columns
    try {
      const resp = await client.get(`/api/v1/db/meta/tables/${tableId}`);
      console.log('\n✓ Table info includes columns:', resp.data.columns?.length, 'columns');
      if (resp.data.columns) {
        console.log('Column names:', resp.data.columns.map((c: any) => c.title).join(', '));
      }
    } catch (e: any) {
      console.log('✗ Table info:', e.response?.status);
    }
    
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

testColumns();