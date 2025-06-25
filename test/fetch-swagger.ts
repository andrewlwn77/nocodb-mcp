#!/usr/bin/env tsx
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function fetchSwagger() {
  const client = axios.create({
    baseURL: process.env.NOCODB_BASE_URL,
    headers: {
      'xc-token': process.env.NOCODB_API_TOKEN,
    },
  });

  try {
    // Try to get swagger.json
    const baseId = 'p9mv0dtwj84k6nu';
    
    // Try different swagger endpoints
    const endpoints = [
      `/api/v2/meta/bases/${baseId}/swagger.json`,
      `/api/v2/meta/bases/${baseId}/swagger`,
      `/api/v1/db/meta/projects/${baseId}/swagger.json`,
      `/swagger.json`,
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying ${endpoint}...`);
        const resp = await client.get(endpoint);
        
        if (typeof resp.data === 'object') {
          // Save swagger JSON
          fs.writeFileSync('swagger.json', JSON.stringify(resp.data, null, 2));
          console.log('✓ Saved swagger.json');
          
          // Look for record operations
          if (resp.data.paths) {
            console.log('\nRecord-related endpoints:');
            Object.entries(resp.data.paths).forEach(([path, methods]: [string, any]) => {
              if (path.includes('record')) {
                console.log(`\n${path}:`);
                Object.keys(methods).forEach(method => {
                  console.log(`  ${method.toUpperCase()}`);
                });
              }
            });
          }
          
          return;
        }
      } catch (e: any) {
        console.log(`✗ ${endpoint}: ${e.response?.status || e.message}`);
      }
    }
    
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

fetchSwagger();