#!/usr/bin/env node

const { executeQuery } = require('../lib/mysql-connection');

async function createVendorsTable() {
  console.log('Creating vendors table...');
  
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
        vendor_type ENUM('medicine', 'equipment', 'supplies', 'services', 'other') NOT NULL,
        payment_terms VARCHAR(100),
        credit_limit DECIMAL(12,2) DEFAULT 0.00,
        is_active BOOLEAN DEFAULT TRUE,
        rating DECIMAL(2,1) DEFAULT 0.0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_vendor_id (vendor_id),
        INDEX idx_vendor_name (vendor_name),
        INDEX idx_vendor_type (vendor_type),
        INDEX idx_is_active (is_active)
      )
    `, []);
    
    console.log('✅ Vendors table created successfully');
    
    // Create purchase_orders table as well since it's referenced
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        po_id VARCHAR(20) UNIQUE NOT NULL,
        vendor_id INT NOT NULL,
        po_date DATE NOT NULL,
        final_amount DECIMAL(12,2) NOT NULL,
        status ENUM('draft', 'sent', 'confirmed', 'completed', 'cancelled') DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (vendor_id) REFERENCES vendors(id),
        INDEX idx_po_id (po_id),
        INDEX idx_vendor_id (vendor_id)
      )
    `, []);
    
    console.log('✅ Purchase orders table created successfully');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  }
}

createVendorsTable();
