#!/usr/bin/env tsx
import fs from 'fs';

const swagger = JSON.parse(fs.readFileSync('swagger.json', 'utf-8'));

// Find PATCH and DELETE endpoints
console.log('=== PATCH Endpoints ===');
Object.entries(swagger.paths).forEach(([path, methods]: [string, any]) => {
  if (methods.patch && path.includes('/records')) {
    console.log(`\n${path}:`);
    const patch = methods.patch;
    console.log('Summary:', patch.summary);
    console.log('OperationId:', patch.operationId);
    
    if (patch.requestBody) {
      console.log('Request Body:');
      const content = patch.requestBody.content?.['application/json'];
      if (content?.schema) {
        console.log('  Type:', content.schema.type);
        if (content.schema.oneOf) {
          console.log('  Options:', content.schema.oneOf.map((o: any) => o.type).join(' or '));
        }
        if (content.schema.items) {
          console.log('  Items:', content.schema.items);
        }
        if (content.examples) {
          console.log('  Examples:', JSON.stringify(content.examples, null, 2));
        }
      }
    }
  }
});

console.log('\n\n=== DELETE Endpoints ===');
Object.entries(swagger.paths).forEach(([path, methods]: [string, any]) => {
  if (methods.delete && path.includes('/records')) {
    console.log(`\n${path}:`);
    const del = methods.delete;
    console.log('Summary:', del.summary);
    console.log('OperationId:', del.operationId);
    
    if (del.requestBody) {
      console.log('Request Body:');
      const content = del.requestBody.content?.['application/json'];
      if (content?.schema) {
        console.log('  Schema:', JSON.stringify(content.schema, null, 2));
      }
    }
    
    if (del.parameters) {
      console.log('Parameters:');
      del.parameters.forEach((param: any) => {
        console.log(`  - ${param.name} (${param.in}): ${param.description}`);
      });
    }
  }
});

// Look for specific table
const testTableId = 'm543xqk3em7ef2x';
console.log(`\n\n=== Operations for table ${testTableId} ===`);
const tablePath = `/api/v2/tables/${testTableId}/records`;
if (swagger.paths[tablePath]) {
  const ops = swagger.paths[tablePath];
  if (ops.patch) {
    console.log('\nPATCH:', JSON.stringify(ops.patch.requestBody?.content?.['application/json'], null, 2));
  }
  if (ops.delete) {
    console.log('\nDELETE:', JSON.stringify(ops.delete.requestBody?.content?.['application/json'], null, 2));
  }
}