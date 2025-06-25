#!/usr/bin/env tsx
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const baseUrl = process.env.NOCODB_BASE_URL;
const apiToken = process.env.NOCODB_API_TOKEN;

async function testEndpoints() {
  const client = axios.create({
    baseURL: baseUrl,
    headers: {
      'xc-token': apiToken,
    },
  });

  try {
    // Get base
    const basesResp = await client.get('/api/v1/db/meta/projects');
    const baseId = basesResp.data.list[0].id;
    const baseName = basesResp.data.list[0].title;
    
    // Get table
    const tablesResp = await client.get(`/api/v1/db/meta/projects/${baseId}/tables`);
    const table = tablesResp.data.list[0];
    const tableId = table.id;
    const tableName = table.table_name;
    
    console.log('Base:', baseName, baseId);
    console.log('Table:', tableName, tableId);
    
    // Test data endpoints
    console.log('\nTesting data endpoints...');
    
    // Single record
    try {
      const resp = await client.get(`/api/v1/db/data/v1/${baseId}/${tableName}`);
      console.log('✓ List records works');
    } catch (e: any) {
      console.log('✗ List records:', e.response?.status, e.response?.data?.msg);
    }
    
    // Bulk endpoint - try different variations
    console.log('\nTesting bulk endpoints...');
    
    try {
      const resp = await client.post(`/api/v1/db/data/bulk/v1/${baseId}/${tableName}`, []);
      console.log('✓ Bulk v1 works');
    } catch (e: any) {
      console.log('✗ Bulk v1:', e.response?.status);
    }
    
    try {
      const resp = await client.post(`/api/v2/tables/${tableId}/records`, { list: [] });
      console.log('✓ Bulk v2 works');
    } catch (e: any) {
      console.log('✗ Bulk v2:', e.response?.status);
    }
    
    // Views endpoint
    console.log('\nTesting view endpoints...');
    
    try {
      const resp = await client.get(`/api/v1/db/meta/views/${tableId}`);
      console.log('✓ Views v1 works');
    } catch (e: any) {
      console.log('✗ Views v1:', e.response?.status);
    }
    
    try {
      const resp = await client.get(`/api/v2/meta/tables/${tableId}/views`);
      console.log('✓ Views v2 works');
    } catch (e: any) {
      console.log('✗ Views v2:', e.response?.status);
    }
    
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

testEndpoints();