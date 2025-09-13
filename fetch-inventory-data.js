#!/usr/bin/env node

const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'srv2047.hstgr.io',
  user: 'u153229971_admin',
  password: 'Admin!2025',
  database: 'u153229971_Hospital',
  port: 3306
};

async function fetchInventoryData() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL database\n');

    // Show all tables to find inventory-related tables
    console.log('🔍 Checking for inventory-related tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    
    const inventoryTables = tables.filter(table => {
      const tableName = Object.values(table)[0].toLowerCase();
      return tableName.includes('inventory') || 
             tableName.includes('medicine') || 
             tableName.includes('drug') || 
             tableName.includes('stock') || 
             tableName.includes('pharmacy') ||
             tableName.includes('item');
    });

    if (inventoryTables.length === 0) {
      console.log('❌ No inventory-related tables found');
      console.log('\n📋 All available tables:');
      tables.forEach(table => {
        console.log(`   - ${Object.values(table)[0]}`);
      });
      return;
    }

    console.log('\n📋 Found inventory-related tables:');
    inventoryTables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });

    // Query each inventory table
    for (const table of inventoryTables) {
      const tableName = Object.values(table)[0];
      console.log(`\n🏥 === ${tableName.toUpperCase()} DATA ===`);
      
      try {
        // Get table structure
        const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
        console.log('\n📊 Table Structure:');
        columns.forEach(col => {
          console.log(`   ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
        });

        // Get all data
        const [rows] = await connection.execute(`SELECT * FROM ${tableName}`);
        console.log(`\n📦 Total Records: ${rows.length}`);
        
        if (rows.length > 0) {
          console.log('\n📋 Sample Data (first 10 records):');
          rows.slice(0, 10).forEach((row, index) => {
            console.log(`   ${index + 1}. ${JSON.stringify(row, null, 2)}`);
          });
          
          // Calculate totals if quantity field exists
          const quantityFields = columns.filter(col => 
            col.Field.toLowerCase().includes('quantity') || 
            col.Field.toLowerCase().includes('stock') ||
            col.Field.toLowerCase().includes('amount')
          );
          
          if (quantityFields.length > 0) {
            console.log('\n📊 Quantity Summary:');
            quantityFields.forEach(field => {
              const fieldName = field.Field;
              const total = rows.reduce((sum, row) => sum + (parseInt(row[fieldName]) || 0), 0);
              console.log(`   Total ${fieldName}: ${total}`);
            });
          }
        } else {
          console.log('   No data found in this table');
        }
        
      } catch (error) {
        console.log(`❌ Error querying ${tableName}: ${error.message}`);
      }
    }

    await connection.end();
    console.log('\n✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

fetchInventoryData();
