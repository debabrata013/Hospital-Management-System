#!/usr/bin/env node

const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'srv2047.hstgr.io',
  user: 'u153229971_admin',
  password: 'Admin!2025',
  database: 'u153229971_Hospital',
  port: 3306
};

async function getRealInventoryCounts() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL database\n');

    // Get ALL tables first
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('🔍 All available tables:');
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });

    let totalItems = 0;
    let criticalStock = 0;
    let expiringSoon = 0;
    let totalValue = 0;
    let allInventoryData = [];

    console.log('\n📊 === COMPREHENSIVE INVENTORY ANALYSIS ===\n');

    // Check each table for inventory-related data
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      
      try {
        // Get table structure
        const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
        
        // Check if this table has inventory-related fields
        const hasQuantity = columns.some(col => col.Field.toLowerCase().includes('quantity') || col.Field.toLowerCase().includes('stock'));
        const hasPrice = columns.some(col => col.Field.toLowerCase().includes('price') || col.Field.toLowerCase().includes('amount') || col.Field.toLowerCase().includes('cost'));
        const hasExpiry = columns.some(col => col.Field.toLowerCase().includes('expiry') || col.Field.toLowerCase().includes('expire'));
        
        if (hasQuantity || hasPrice || tableName.toLowerCase().includes('medicine') || tableName.toLowerCase().includes('inventory') || tableName.toLowerCase().includes('stock') || tableName.toLowerCase().includes('item')) {
          
          console.log(`\n🏥 === ${tableName.toUpperCase()} ===`);
          
          // Get all data
          const [rows] = await connection.execute(`SELECT * FROM ${tableName}`);
          console.log(`📦 Records: ${rows.length}`);
          
          if (rows.length > 0) {
            // Calculate totals based on available fields
            let tableTotalItems = 0;
            let tableTotalValue = 0;
            let tableCriticalStock = 0;
            let tableExpiringSoon = 0;
            
            rows.forEach(row => {
              // Count items
              if (row.quantity || row.current_stock || row.stock) {
                const qty = parseInt(row.quantity || row.current_stock || row.stock || 0);
                tableTotalItems += qty;
                
                // Check for critical stock (less than minimum)
                if (row.minimum_stock && qty <= row.minimum_stock) {
                  tableCriticalStock += qty;
                }
              }
              
              // Calculate value
              if (row.unit_price || row.total_price || row.price) {
                const price = parseFloat(row.unit_price || row.total_price || row.price || 0);
                const qty = parseInt(row.quantity || row.current_stock || row.stock || 1);
                tableTotalValue += price * qty;
              }
              
              // Check for expiring items (within 30 days)
              if (row.expiry_date) {
                const expiryDate = new Date(row.expiry_date);
                const today = new Date();
                const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                
                if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) {
                  const qty = parseInt(row.quantity || row.current_stock || row.stock || 0);
                  tableExpiringSoon += qty;
                }
              }
            });
            
            console.log(`   Items: ${tableTotalItems}`);
            console.log(`   Critical Stock: ${tableCriticalStock}`);
            console.log(`   Expiring Soon: ${tableExpiringSoon}`);
            console.log(`   Total Value: ₹${tableTotalValue.toFixed(2)}`);
            
            totalItems += tableTotalItems;
            criticalStock += tableCriticalStock;
            expiringSoon += tableExpiringSoon;
            totalValue += tableTotalValue;
            
            // Store detailed data
            allInventoryData.push({
              table: tableName,
              records: rows.length,
              items: tableTotalItems,
              criticalStock: tableCriticalStock,
              expiringSoon: tableExpiringSoon,
              totalValue: tableTotalValue,
              data: rows
            });
          }
        }
        
      } catch (error) {
        console.log(`❌ Error processing ${tableName}: ${error.message}`);
      }
    }

    console.log('\n🎯 === FINAL REAL COUNTS ===');
    console.log(`📦 Total Items: ${totalItems.toLocaleString()}`);
    console.log(`⚠️  Critical Stock: ${criticalStock.toLocaleString()}`);
    console.log(`📅 Expiring Soon: ${expiringSoon.toLocaleString()}`);
    console.log(`💰 Total Value: ₹${totalValue.toLocaleString()}`);

    // Detailed breakdown
    console.log('\n📋 === DETAILED BREAKDOWN ===');
    allInventoryData.forEach(item => {
      if (item.items > 0 || item.totalValue > 0) {
        console.log(`\n${item.table}:`);
        console.log(`   Records: ${item.records}`);
        console.log(`   Items: ${item.items.toLocaleString()}`);
        console.log(`   Critical: ${item.criticalStock.toLocaleString()}`);
        console.log(`   Expiring: ${item.expiringSoon.toLocaleString()}`);
        console.log(`   Value: ₹${item.totalValue.toLocaleString()}`);
      }
    });

    await connection.end();
    console.log('\n✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

getRealInventoryCounts();
