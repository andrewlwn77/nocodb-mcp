#!/usr/bin/env tsx
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function checkVersion() {
  const client = axios.create({
    baseURL: process.env.NOCODB_BASE_URL,
    headers: {
      'xc-token': process.env.NOCODB_API_TOKEN,
    },
  });

  try {
    // Try to get version info
    const endpoints = [
      '/api/v1/version',
      '/api/v2/version',
      '/api/v1/health',
      '/api/v2/health',
      '/api/v1/meta/info',
      '/api/v2/meta/info',
    ];
    
    for (const endpoint of endpoints) {
      try {
        const resp = await client.get(endpoint);
        console.log(`✓ ${endpoint}:`, resp.data);
      } catch (e: any) {
        console.log(`✗ ${endpoint}: ${e.response?.status}`);
      }
    }
    
    // Check what works for data
    console.log('\nChecking working endpoints...');
    
    const basesResp = await client.get('/api/v1/db/meta/projects');
    const base = basesResp.data.list[0];
    const tablesResp = await client.get(`/api/v1/db/meta/projects/${base.id}/tables`);
    const table = tablesResp.data.list.find((t: any) => t.title.includes('test_mcp_table'));
    
    if (table) {
      // Views
      const viewsResp = await client.get(`/api/v2/meta/tables/${table.id}/views`);
      const viewId = viewsResp.data.list[0].id;
      console.log('View ID:', viewId);
      
      // Try data endpoints with view
      try {
        const resp = await client.get(`/api/v1/db/data/noco/${base.id}/${table.id}/views/${viewId}`);
        console.log('✓ v1 data with view works:', resp.data.list?.length, 'records');
      } catch (e: any) {
        console.log('✗ v1 data with view:', e.response?.status);
      }
    }
    
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

checkVersion();