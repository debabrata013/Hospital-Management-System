#!/usr/bin/env node

const { executeQuery, testConnection } = require('../lib/mysql-connection');

async function setupPharmacyTables() {
  console.log('🔧 Setting up Pharmacy System Tables...\n');

  try {
    // Test connection
    const connected = await testConnection();
    if (!connected) throw new Error('Database connection failed');

    // Create missing tables
    await createVendorsTable();
    await createPurchaseOrdersTable();
    await ensurePrescriptionMedicationsTable();
    
    console.log('\n✅ All pharmacy tables are ready!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

async function createVendorsTable() {
  try {
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS vendors (
        id INT PRIMARY KEY AUTO_INCREMENT,
        vendor_id VARCHAR(20) UNIQUE NOT NULL,
        vendor_name VARCHAR(100) NOT NULL,
        contact_person VARCHAR(100),
        email VARCHAR(255),
        phone VARCHAR(15) NOT NULL,
        address TEXT,
        city VARCHAR(50),
        state VARCHAR(50),
        pincode VARCHAR(10),
        gst_number VARCHAR(15),
        pan_number VARCHAR(10),
        vendor_type ENUM('medicine', 'equipment', 'supplies', 'services', 'other') DEFAULT 'medicine',
        payment_terms VARCHAR(100),
        credit_limit DECIMAL(12,2) DEFAULT 0.00,
        is_active BOOLEAN DEFAULT TRUE,
        rating DECIMAL(2,1) DEFAULT 0.0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `, []);
    console.log('✓ Vendors table ready');
  } catch (error) {
    console.log('⚠️ Vendors table error:', error.message);
  }
}

async function createPurchaseOrdersTable() {
  try {
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        po_id VARCHAR(20) UNIQUE NOT NULL,
        vendor_id INT NOT NULL,
        po_date DATE NOT NULL,
        final_amount DECIMAL(12,2) DEFAULT 0.00,
        status ENUM('draft', 'sent', 'confirmed', 'completed', 'cancelled') DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, []);
    console.log('✓ Purchase orders table ready');
  } catch (error) {
    console.log('⚠️ Purchase orders table error:', error.message);
  }
}

async function ensurePrescriptionMedicationsTable() {
  try {
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS prescription_medications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        prescription_id INT NOT NULL,
        medicine_id VARCHAR(20),
        medicine_name VARCHAR(100) NOT NULL,
        dosage VARCHAR(50) NOT NULL,
        frequency VARCHAR(50) NOT NULL,
        duration VARCHAR(50) NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(8,2) DEFAULT 0.00,
        total_price DECIMAL(8,2) DEFAULT 0.00,
        instructions TEXT,
        is_dispensed BOOLEAN DEFAULT FALSE,
        dispensed_at TIMESTAMP NULL,
        dispensed_by INT NULL
      )
    `, []);
    console.log('✓ Prescription medications table ready');
  } catch (error) {
    console.log('⚠️ Prescription medications table error:', error.message);
  }
}

setupPharmacyTables();
