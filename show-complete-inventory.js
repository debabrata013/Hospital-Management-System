#!/usr/bin/env node

const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'srv2047.hstgr.io',
  user: 'u153229971_admin',
  password: 'Admin!2025',
  database: 'u153229971_Hospital',
  port: 3306
};

async function showCompleteInventory() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('🏥 === COMPLETE INVENTORY DATA FROM DATABASE ===\n');

    let totalItems = 0;
    let totalValue = 0;
    let criticalStock = 0;
    let expiringSoon = 0;

    // 1. MEDICINES - Main Inventory
    console.log('💊 === MEDICINES INVENTORY ===');
    const [medicines] = await connection.execute('SELECT * FROM medicines ORDER BY current_stock DESC');
    
    medicines.forEach((med, index) => {
      const qty = parseInt(med.current_stock || 0);
      const price = parseFloat(med.unit_price || 0);
      const value = qty * price;
      
      totalItems += qty;
      totalValue += value;
      
      if (med.minimum_stock && qty <= med.minimum_stock) {
        criticalStock += qty;
      }
      
      if (med.expiry_date) {
        const expiryDate = new Date(med.expiry_date);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) {
          expiringSoon += qty;
        }
      }
      
      console.log(`${index + 1}. ${med.name || 'Unnamed'}`);
      console.log(`   ID: ${med.medicine_id || 'N/A'}`);
      console.log(`   Category: ${med.category || 'N/A'}`);
      console.log(`   Strength: ${med.strength || 'N/A'}`);
      console.log(`   Current Stock: ${qty.toLocaleString()} units`);
      console.log(`   Unit Price: ₹${price.toFixed(2)}`);
      console.log(`   Total Value: ₹${value.toFixed(2)}`);
      console.log(`   Status: ${med.is_active ? 'Active' : 'Inactive'}`);
      console.log(`   Min Stock: ${med.minimum_stock || 0}`);
      console.log(`   Max Stock: ${med.maximum_stock || 0}`);
      if (med.expiry_date) console.log(`   Expiry: ${med.expiry_date}`);
      console.log('');
    });

    // 2. STOCK TRANSACTIONS
    console.log('📦 === STOCK TRANSACTIONS ===');
    const [transactions] = await connection.execute('SELECT * FROM medicine_stock_transactions');
    
    transactions.forEach((txn, index) => {
      const qty = parseInt(txn.quantity || 0);
      const value = parseFloat(txn.total_amount || 0);
      
      totalItems += qty;
      totalValue += value;
      
      console.log(`${index + 1}. Transaction ${txn.transaction_id}`);
      console.log(`   Type: ${txn.transaction_type}`);
      console.log(`   Medicine ID: ${txn.medicine_id}`);
      console.log(`   Quantity: ${qty.toLocaleString()} units`);
      console.log(`   Unit Price: ₹${parseFloat(txn.unit_price || 0).toFixed(2)}`);
      console.log(`   Total Amount: ₹${value.toFixed(2)}`);
      console.log(`   Batch: ${txn.batch_number || 'N/A'}`);
      console.log(`   Supplier: ${txn.supplier || 'N/A'}`);
      if (txn.expiry_date) console.log(`   Expiry: ${txn.expiry_date}`);
      console.log(`   Date: ${txn.created_at}`);
      console.log('');
    });

    // 3. PRESCRIPTION MEDICATIONS
    console.log('💉 === PRESCRIPTION MEDICATIONS ===');
    const [prescriptions] = await connection.execute('SELECT * FROM prescription_medications');
    
    prescriptions.forEach((pres, index) => {
      const qty = parseInt(pres.quantity || 0);
      const price = parseFloat(pres.unit_price || 0);
      const value = qty * price;
      
      totalItems += qty;
      totalValue += value;
      
      console.log(`${index + 1}. Prescription ${pres.id}`);
      console.log(`   Medicine: ${pres.medicine_name || 'N/A'}`);
      console.log(`   Quantity: ${qty.toLocaleString()} units`);
      console.log(`   Unit Price: ₹${price.toFixed(2)}`);
      console.log(`   Total Value: ₹${value.toFixed(2)}`);
      console.log(`   Dosage: ${pres.dosage || 'N/A'}`);
      console.log(`   Instructions: ${pres.instructions || 'N/A'}`);
      console.log('');
    });

    // 4. BILL ITEMS
    console.log('🧾 === BILL ITEMS ===');
    const [billItems] = await connection.execute('SELECT * FROM bill_items');
    
    billItems.forEach((bill, index) => {
      const qty = parseInt(bill.quantity || 0);
      const value = parseFloat(bill.total_price || 0);
      
      totalItems += qty;
      totalValue += value;
      
      console.log(`${index + 1}. Bill Item ${bill.id}`);
      console.log(`   Type: ${bill.item_type}`);
      console.log(`   Name: ${bill.item_name}`);
      console.log(`   Description: ${bill.item_description || 'N/A'}`);
      console.log(`   Quantity: ${qty.toLocaleString()} units`);
      console.log(`   Unit Price: ₹${parseFloat(bill.unit_price || 0).toFixed(2)}`);
      console.log(`   Total Price: ₹${value.toFixed(2)}`);
      console.log(`   Discount: ${bill.discount_percent || 0}%`);
      console.log(`   Date: ${bill.created_at}`);
      console.log('');
    });

    // FINAL SUMMARY
    console.log('🎯 === FINAL INVENTORY SUMMARY ===');
    console.log(`📦 Total Items: ${totalItems.toLocaleString()}`);
    console.log(`⚠️  Critical Stock: ${criticalStock.toLocaleString()}`);
    console.log(`📅 Expiring Soon: ${expiringSoon.toLocaleString()}`);
    console.log(`💰 Total Value: ₹${totalValue.toLocaleString()}`);
    
    console.log('\n📊 === BREAKDOWN BY TABLE ===');
    console.log(`💊 Medicines: ${medicines.length} records`);
    console.log(`📦 Stock Transactions: ${transactions.length} records`);
    console.log(`💉 Prescriptions: ${prescriptions.length} records`);
    console.log(`🧾 Bill Items: ${billItems.length} records`);

    await connection.end();
    console.log('\n✅ Database connection closed');
    console.log('\n🏥 INVENTORY DATA COMPLETE!');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

showCompleteInventory();
