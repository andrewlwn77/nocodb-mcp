#!/usr/bin/env tsx
import { NocoDBClient } from '../src/nocodb-api.js';
import dotenv from 'dotenv';
import { NocoDBConfig } from '../src/types.js';

// Load environment variables
dotenv.config();

// Test configuration
const config: NocoDBConfig = {
  baseUrl: process.env.NOCODB_BASE_URL || 'http://localhost:8080',
  apiToken: process.env.NOCODB_API_TOKEN,
};

const client = new NocoDBClient(config);

// ANSI color codes
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

function log(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
  const prefix = {
    info: `${BLUE}[INFO]${RESET}`,
    success: `${GREEN}[SUCCESS]${RESET}`,
    error: `${RED}[ERROR]${RESET}`,
    warning: `${YELLOW}[WARNING]${RESET}`,
  };
  console.log(`${prefix[type]} ${message}`);
}

async function createProductCatalog() {
  log('\n=== Real-World Example: Product Catalog ===\n', 'info');
  
  let baseId: string;
  let tableId: string;
  const tableName = 'products_' + Date.now();
  
  try {
    // Get base
    const bases = await client.listBases();
    baseId = bases[0].id;
    log(`Using base: ${bases[0].title}`, 'info');
    
    // Step 1: Create basic table
    log('\nStep 1: Creating basic products table...', 'info');
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
        title: 'Product Name',
        column_name: 'product_name',
        uidt: 'SingleLineText',
        rqd: true,
      },
      {
        title: 'SKU',
        column_name: 'sku',
        uidt: 'SingleLineText',
        unique: true,
        rqd: true,
      },
    ]);
    tableId = table.id;
    log(`✓ Table created: ${table.title}`, 'success');
    
    // Step 2: Add product details columns
    log('\nStep 2: Adding product detail columns...', 'info');
    
    await client.addColumn(tableId, {
      title: 'Description',
      uidt: 'LongText',
    });
    log('✓ Added Description column', 'success');
    
    await client.addColumn(tableId, {
      title: 'Category',
      uidt: 'SingleSelect',
      meta: {
        options: [
          { title: 'Electronics', color: '#3b82f6' },
          { title: 'Clothing', color: '#10b981' },
          { title: 'Home & Garden', color: '#f59e0b' },
          { title: 'Sports', color: '#ef4444' },
          { title: 'Books', color: '#8b5cf6' },
        ],
      },
    });
    log('✓ Added Category column with options', 'success');
    
    await client.addColumn(tableId, {
      title: 'Price',
      uidt: 'Currency',
      meta: { currency_code: 'USD' },
      rqd: true,
    });
    log('✓ Added Price column', 'success');
    
    await client.addColumn(tableId, {
      title: 'Cost',
      uidt: 'Currency',
      meta: { currency_code: 'USD' },
    });
    log('✓ Added Cost column', 'success');
    
    await client.addColumn(tableId, {
      title: 'Stock Quantity',
      column_name: 'stock_qty',
      uidt: 'Number',
      dt: 'int',
      cdf: '0',
    });
    log('✓ Added Stock Quantity column with default 0', 'success');
    
    // Step 3: Add metadata columns
    log('\nStep 3: Adding metadata columns...', 'info');
    
    await client.addColumn(tableId, {
      title: 'In Stock',
      uidt: 'Checkbox',
      cdf: 'true',
    });
    log('✓ Added In Stock checkbox', 'success');
    
    await client.addColumn(tableId, {
      title: 'Tags',
      uidt: 'MultiSelect',
      meta: {
        options: [
          { title: 'New', color: '#10b981' },
          { title: 'Sale', color: '#ef4444' },
          { title: 'Featured', color: '#f59e0b' },
          { title: 'Limited Edition', color: '#8b5cf6' },
          { title: 'Bestseller', color: '#3b82f6' },
        ],
      },
    });
    log('✓ Added Tags multi-select column', 'success');
    
    await client.addColumn(tableId, {
      title: 'Launch Date',
      uidt: 'Date',
    });
    log('✓ Added Launch Date column', 'success');
    
    await client.addColumn(tableId, {
      title: 'Last Updated',
      uidt: 'DateTime',
    });
    log('✓ Added Last Updated column', 'success');
    
    // Step 4: Add advanced columns
    log('\nStep 4: Adding advanced columns...', 'info');
    
    await client.addColumn(tableId, {
      title: 'Product Images',
      uidt: 'Attachment',
    });
    log('✓ Added Product Images attachment column', 'success');
    
    await client.addColumn(tableId, {
      title: 'Specifications',
      uidt: 'JSON',
    });
    log('✓ Added Specifications JSON column', 'success');
    
    await client.addColumn(tableId, {
      title: 'Discount',
      uidt: 'Percent',
    });
    log('✓ Added Discount percentage column', 'success');
    
    await client.addColumn(tableId, {
      title: 'Rating',
      uidt: 'Rating',
    });
    log('✓ Added Rating column', 'success');
    
    await client.addColumn(tableId, {
      title: 'Product URL',
      uidt: 'URL',
    });
    log('✓ Added Product URL column', 'success');
    
    // Step 5: Verify table schema
    log('\nStep 5: Verifying final table schema...', 'info');
    const columns = await client.listColumns(tableId);
    log(`Total columns: ${columns.length}`, 'info');
    
    // Step 6: Insert sample data
    log('\nStep 6: Inserting sample products...', 'info');
    
    const sampleProducts = [
      {
        'Product Name': 'Wireless Bluetooth Headphones',
        SKU: 'WBH-001',
        Description: 'High-quality wireless headphones with noise cancellation',
        Category: 'Electronics',
        Price: 89.99,
        Cost: 45.00,
        'Stock Quantity': 150,
        'In Stock': true,
        Tags: ['Bestseller', 'Featured'],
        'Launch Date': '2024-01-15',
        'Last Updated': new Date().toISOString(),
        Specifications: {
          battery_life: '30 hours',
          bluetooth_version: '5.0',
          weight: '250g',
        },
        Discount: 10,
        Rating: 4,
        'Product URL': 'https://example.com/products/wbh-001',
      },
      {
        'Product Name': 'Organic Cotton T-Shirt',
        SKU: 'OCT-002',
        Description: 'Comfortable and sustainable organic cotton t-shirt',
        Category: 'Clothing',
        Price: 29.99,
        Cost: 12.00,
        'Stock Quantity': 500,
        'In Stock': true,
        Tags: ['New', 'Sale'],
        'Launch Date': '2024-03-01',
        'Last Updated': new Date().toISOString(),
        Specifications: {
          material: '100% Organic Cotton',
          sizes: ['S', 'M', 'L', 'XL'],
          colors: ['White', 'Black', 'Navy', 'Gray'],
        },
        Discount: 20,
        Rating: 5,
        'Product URL': 'https://example.com/products/oct-002',
      },
    ];
    
    for (const product of sampleProducts) {
      const record = await client.createRecord(baseId, tableName, product);
      log(`✓ Created product: ${product['Product Name']} (ID: ${record.ID})`, 'success');
    }
    
    // Step 7: Query the data
    log('\nStep 7: Querying products...', 'info');
    const products = await client.listRecords(baseId, tableName);
    log(`Found ${products.list.length} products`, 'success');
    
    // Display product summary
    log('\nProduct Catalog Summary:', 'info');
    products.list.forEach(product => {
      console.log(`
  Product: ${product['Product Name']}
  - SKU: ${product.SKU}
  - Category: ${product.Category}
  - Price: $${product.Price}
  - Stock: ${product['Stock Quantity']}
  - Tags: ${product.Tags || 'None'}
  - Rating: ${'⭐'.repeat(product.Rating || 0)}
      `);
    });
    
    // Cleanup
    log('\nCleaning up...', 'info');
    await client.deleteTable(tableId);
    log('✓ Test table deleted', 'success');
    
    log('\n✓ Integration test completed successfully!', 'success');
    
  } catch (error: any) {
    log(`\nError: ${error.message}`, 'error');
    
    // Try to cleanup on error
    if (tableId) {
      try {
        await client.deleteTable(tableId);
        log('Cleaned up test table', 'info');
      } catch (cleanupError) {
        log('Failed to cleanup test table', 'warning');
      }
    }
  }
}

// Run the integration test
createProductCatalog();