#!/usr/bin/env tsx
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const baseUrl = process.env.NOCODB_BASE_URL;
const apiToken = process.env.NOCODB_API_TOKEN;

async function testDataAPI() {
  const client = axios.create({
    baseURL: baseUrl,
    headers: {
      'xc-token': apiToken,
    },
  });

  try {
    // Get base
    const basesResp = await client.get('/api/v1/db/meta/projects');
    const base = basesResp.data.list[0];
    const baseId = base.id;
    
    // Get table  
    const tablesResp = await client.get(`/api/v1/db/meta/projects/${baseId}/tables`);
    const table = tablesResp.data.list[0];
    const tableId = table.id;
    const tableName = table.table_name;
    const tableTitle = table.title;
    
    console.log('Base:', base.title);
    console.log('Table ID:', tableId);
    console.log('Table Name:', tableName);
    console.log('Table Title:', tableTitle);
    
    // Get views to find the correct table/view ID
    const viewsResp = await client.get(`/api/v2/meta/tables/${tableId}/views`);
    console.log('\nViews:', viewsResp.data.list?.map((v: any) => ({ id: v.id, title: v.title })));
    
    // Try different data endpoints
    console.log('\nTesting data endpoints...');
    
    // Try with view ID
    if (viewsResp.data.list?.length > 0) {
      const viewId = viewsResp.data.list[0].id;
      try {
        const resp = await client.get(`/api/v2/tables/${tableId}/records`, {
          params: { viewId }
        });
        console.log('✓ v2 records with viewId works:', resp.data.list?.length, 'records');
      } catch (e: any) {
        console.log('✗ v2 records:', e.response?.status, e.response?.data);
      }
    }
    
    // Try direct table records
    try {
      const resp = await client.get(`/api/v2/tables/${tableId}/records`);
      console.log('✓ v2 records works:', resp.data.list?.length, 'records');
    } catch (e: any) {
      console.log('✗ v2 records:', e.response?.status, e.response?.data);
    }
    
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

testDataAPI();