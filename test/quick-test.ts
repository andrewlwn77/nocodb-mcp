#!/usr/bin/env tsx
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const baseUrl = process.env.NOCODB_BASE_URL;
const apiToken = process.env.NOCODB_API_TOKEN;

async function testAPI() {
  const client = axios.create({
    baseURL: baseUrl,
    headers: {
      'xc-token': apiToken,
    },
  });

  try {
    // Test v1 API
    console.log('Testing v1 API...');
    const v1Response = await client.get('/api/v1/db/meta/projects').catch(e => null);
    if (v1Response) {
      console.log('v1 API works:', v1Response.data.list?.length, 'projects');
    } else {
      console.log('v1 API failed');
    }

    // Test v2 API  
    console.log('\nTesting v2 API...');
    const v2Response = await client.get('/api/v2/meta/bases').catch(e => null);
    if (v2Response) {
      console.log('v2 API works:', v2Response.data.list?.length, 'bases');
    } else {
      console.log('v2 API failed');
    }

    // Get first base/project
    const bases = v1Response?.data.list || v2Response?.data.list || [];
    if (bases.length > 0) {
      const baseId = bases[0].id;
      console.log('\nUsing base:', bases[0].title, '(', baseId, ')');
      
      // Test table endpoints
      console.log('\nTesting table endpoints...');
      const tablesV1 = await client.get(`/api/v1/db/meta/projects/${baseId}/tables`).catch(e => null);
      if (tablesV1) {
        console.log('v1 tables endpoint works');
      }
      
      const tablesV2 = await client.get(`/api/v2/meta/bases/${baseId}/tables`).catch(e => null);
      if (tablesV2) {
        console.log('v2 tables endpoint works');
      }
    }
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

testAPI();