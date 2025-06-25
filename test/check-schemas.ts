#!/usr/bin/env tsx
import fs from 'fs';

const swagger = JSON.parse(fs.readFileSync('swagger.json', 'utf-8'));

// Look for schema definitions
const schemas = swagger.components?.schemas || {};

// Find ID request schemas
console.log('=== ID Request Schemas ===');
Object.entries(schemas).forEach(([name, schema]: [string, any]) => {
  if (name.includes('IdRequest')) {
    console.log(`\n${name}:`);
    console.log(JSON.stringify(schema, null, 2));
  }
});

// Find regular request schemas
console.log('\n\n=== Update Request Schemas ===');
Object.entries(schemas).forEach(([name, schema]: [string, any]) => {
  if (name.includes('Request') && !name.includes('IdRequest') && name.includes('test_mcp_table')) {
    console.log(`\n${name}:`);
    console.log(JSON.stringify(schema, null, 2));
  }
});