#!/usr/bin/env tsx
import { NocoDBClient } from '../src/nocodb-api.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

const config = {
  baseUrl: process.env.NOCODB_BASE_URL || 'http://localhost:8080',
  apiToken: process.env.NOCODB_API_TOKEN,
};

const client = new NocoDBClient(config);

async function testFileUpload() {
  console.log('=== Testing File Upload ===\n');
  
  try {
    // Create a test file
    const testDir = path.join(process.cwd(), 'test');
    const testFilePath = path.join(testDir, 'test-upload.txt');
    const testContent = `Test file content created at ${new Date().toISOString()}\nThis is a test file for NocoDB upload.`;
    
    fs.writeFileSync(testFilePath, testContent);
    console.log('Created test file:', testFilePath);
    
    // Test 1: Upload file
    console.log('\n1. Testing file upload...');
    try {
      const uploadResult = await client.uploadFile(testFilePath);
      console.log('✓ File uploaded successfully:', uploadResult);
    } catch (error: any) {
      console.log('✗ File upload failed:', error.message);
    }
    
    // Test 2: Upload from URL
    console.log('\n2. Testing URL upload...');
    const testUrls = [
      'https://raw.githubusercontent.com/nocodb/nocodb/develop/README.md'
    ];
    
    try {
      const urlUploadResult = await client.uploadByUrl(testUrls);
      console.log('✓ URL upload successful:', urlUploadResult);
    } catch (error: any) {
      console.log('✗ URL upload failed:', error.message);
    }
    
    // Test 3: Create table with attachment field
    console.log('\n3. Creating table with attachment field...');
    const basesResp = await client.listBases();
    const baseId = basesResp[0].id;
    const tableName = 'test_attachments_' + Date.now();
    
    try {
      const table = await client.createTable(baseId, tableName, [
        {
          title: 'ID',
          column_name: 'id',
          uidt: 'ID',
          pk: true,
          ai: true,
          rqd: true,
        },
        {
          title: 'Title',
          column_name: 'title',
          uidt: 'SingleLineText',
          rqd: true,
        },
        {
          title: 'Files',
          column_name: 'files',
          uidt: 'Attachment',
        },
      ]);
      console.log('✓ Table created:', table.title);
      
      // Test 4: Create record and attach file
      console.log('\n4. Creating record with attachment...');
      const record = await client.createRecord(baseId, tableName, {
        Title: 'Test Record with Attachment',
      });
      const recordId = record.ID || record.Id || record.id;
      console.log('✓ Record created with ID:', recordId);
      
      // Upload and attach file
      console.log('\n5. Uploading and attaching file to record...');
      const attachResult = await client.uploadFile(testFilePath);
      
      await client.updateRecord(baseId, tableName, recordId, {
        Files: attachResult,
      });
      console.log('✓ File attached to record');
      
      // Verify attachment
      console.log('\n6. Verifying attachment...');
      const updatedRecord = await client.getRecord(baseId, tableName, recordId);
      console.log('✓ Record with attachment:', {
        id: recordId,
        Title: updatedRecord.Title,
        Files: updatedRecord.Files,
      });
      
      // Cleanup
      console.log('\n7. Cleaning up...');
      await client.deleteRecord(baseId, tableName, recordId);
      await client.deleteTable(table.id);
      console.log('✓ Cleanup complete');
      
    } catch (error: any) {
      console.log('✗ Error:', error.message);
    }
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
    console.log('\n✓ Test file removed');
    
  } catch (error: any) {
    console.error('Test failed:', error.message);
  }
}

testFileUpload();