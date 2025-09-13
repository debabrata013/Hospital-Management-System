// Quick test to fetch all inventory data from database
// Using built-in fetch (Node.js 18+) + Direct Database Query

const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'srv2047.hstgr.io',
  user: 'u153229971_admin',
  password: 'Admin!2025',
  database: 'u153229971_Hospital',
  port: 3306
};

async function getRealDatabaseCounts() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    let totalItems = 0;
    let criticalStock = 0;
    let expiringSoon = 0;
    let totalValue = 0;
    
    // Get medicines data
    const [medicines] = await connection.execute('SELECT * FROM medicines');
    medicines.forEach(med => {
      const qty = parseInt(med.current_stock || 0);
      totalItems += qty;
      
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
      
      totalValue += parseFloat(med.unit_price || 0) * qty;
    });
    
    // Get stock transactions
    const [transactions] = await connection.execute('SELECT * FROM medicine_stock_transactions');
    transactions.forEach(txn => {
      totalItems += parseInt(txn.quantity || 0);
      totalValue += parseFloat(txn.total_amount || 0);
    });
    
    // Get prescription medications
    const [prescriptions] = await connection.execute('SELECT * FROM prescription_medications');
    prescriptions.forEach(pres => {
      totalItems += parseInt(pres.quantity || 0);
      totalValue += parseFloat(pres.unit_price || 0) * parseInt(pres.quantity || 0);
    });
    
    // Get bill items
    const [billItems] = await connection.execute('SELECT * FROM bill_items');
    billItems.forEach(bill => {
      totalItems += parseInt(bill.quantity || 0);
      totalValue += parseFloat(bill.total_price || 0);
    });
    
    await connection.end();
    
    return {
      totalItems,
      criticalStock,
      expiringSoon,
      totalValue,
      medicines: medicines.length,
      transactions: transactions.length,
      prescriptions: prescriptions.length,
      billItems: billItems.length
    };
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    return null;
  }
}

async function testInventoryData() {
  try {
    console.log('🏥 Fetching REAL inventory data from database...\n');
    
    // Get real counts from database
    const realCounts = await getRealDatabaseCounts();
    
    if (realCounts) {
      console.log('🎯 === REAL INVENTORY COUNTS ===');
      console.log(`📦 Total Items: ${realCounts.totalItems.toLocaleString()}`);
      console.log(`⚠️  Critical Stock: ${realCounts.criticalStock.toLocaleString()}`);
      console.log(`📅 Expiring Soon: ${realCounts.expiringSoon.toLocaleString()}`);
      console.log(`💰 Total Value: ₹${realCounts.totalValue.toLocaleString()}`);
      
      console.log('\n📋 === BREAKDOWN BY TABLE ===');
      console.log(`💊 Medicines: ${realCounts.medicines} records`);
      console.log(`📦 Stock Transactions: ${realCounts.transactions} records`);
      console.log(`💉 Prescriptions: ${realCounts.prescriptions} records`);
      console.log(`🧾 Bill Items: ${realCounts.billItems} records`);
      
      console.log('\n✅ REAL COUNTING COMPLETE!');
      console.log(`\n📊 Summary: ${realCounts.totalItems.toLocaleString()} total items worth ₹${realCounts.totalValue.toLocaleString()}`);
      
    } else {
      console.log('❌ Failed to get real counts from database');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testInventoryData();
