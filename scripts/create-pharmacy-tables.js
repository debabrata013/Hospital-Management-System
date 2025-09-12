// Create missing pharmacy tables
// Hospital Management System - NMSC

const { executeQuery } = require('../lib/mysql-connection.js');

async function createPharmacyTables() {
  try {
    console.log('Creating missing pharmacy tables...');

    // 1. Create medicine_stock_transactions table
    console.log('Creating medicine_stock_transactions table...');
    const stockTransactionsTable = `
      CREATE TABLE IF NOT EXISTS medicine_stock_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transaction_id VARCHAR(50) UNIQUE NOT NULL,
        medicine_id INT NOT NULL,
        transaction_type ENUM('IN', 'OUT', 'ADJUSTMENT', 'EXPIRED', 'DAMAGED') NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2),
        total_amount DECIMAL(10,2),
        batch_number VARCHAR(50),
        expiry_date DATE,
        supplier VARCHAR(100),
        reference_number VARCHAR(100),
        notes TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_medicine_id (medicine_id),
        INDEX idx_transaction_type (transaction_type),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await executeQuery(stockTransactionsTable);
    console.log('✅ medicine_stock_transactions table created');

    // 2. Create medicine_suppliers table
    console.log('Creating medicine_suppliers table...');
    const suppliersTable = `
      CREATE TABLE IF NOT EXISTS medicine_suppliers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        supplier_id VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        contact_person VARCHAR(100),
        phone VARCHAR(15),
        email VARCHAR(100),
        address TEXT,
        city VARCHAR(50),
        state VARCHAR(50),
        pincode VARCHAR(10),
        gst_number VARCHAR(20),
        license_number VARCHAR(50),
        payment_terms VARCHAR(100),
        credit_limit DECIMAL(12,2) DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_supplier_id (supplier_id),
        INDEX idx_name (name),
        INDEX idx_is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await executeQuery(suppliersTable);
    console.log('✅ medicine_suppliers table created');

    // 3. Create purchase_orders table
    console.log('Creating purchase_orders table...');
    const purchaseOrdersTable = `
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        po_number VARCHAR(50) UNIQUE NOT NULL,
        supplier_id INT NOT NULL,
        order_date DATE NOT NULL,
        expected_delivery_date DATE,
        status ENUM('DRAFT', 'SENT', 'CONFIRMED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED') DEFAULT 'DRAFT',
        total_amount DECIMAL(12,2) DEFAULT 0,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        tax_amount DECIMAL(10,2) DEFAULT 0,
        final_amount DECIMAL(12,2) DEFAULT 0,
        notes TEXT,
        created_by INT,
        approved_by INT,
        approved_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES medicine_suppliers(id) ON DELETE RESTRICT,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_po_number (po_number),
        INDEX idx_supplier_id (supplier_id),
        INDEX idx_status (status),
        INDEX idx_order_date (order_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await executeQuery(purchaseOrdersTable);
    console.log('✅ purchase_orders table created');

    // 4. Create purchase_order_items table
    console.log('Creating purchase_order_items table...');
    const purchaseOrderItemsTable = `
      CREATE TABLE IF NOT EXISTS purchase_order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        purchase_order_id INT NOT NULL,
        medicine_id INT NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        received_quantity INT DEFAULT 0,
        batch_number VARCHAR(50),
        expiry_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
        INDEX idx_purchase_order_id (purchase_order_id),
        INDEX idx_medicine_id (medicine_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await executeQuery(purchaseOrderItemsTable);
    console.log('✅ purchase_order_items table created');

    // 5. Create medicine_batches table for better batch tracking
    console.log('Creating medicine_batches table...');
    const batchesTable = `
      CREATE TABLE IF NOT EXISTS medicine_batches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        batch_id VARCHAR(50) UNIQUE NOT NULL,
        medicine_id INT NOT NULL,
        batch_number VARCHAR(50) NOT NULL,
        manufacturing_date DATE,
        expiry_date DATE NOT NULL,
        quantity_received INT NOT NULL,
        quantity_available INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        supplier_id INT,
        purchase_order_id INT,
        received_date DATE DEFAULT (CURDATE()),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
        FOREIGN KEY (supplier_id) REFERENCES medicine_suppliers(id) ON DELETE SET NULL,
        FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE SET NULL,
        INDEX idx_medicine_id (medicine_id),
        INDEX idx_batch_number (batch_number),
        INDEX idx_expiry_date (expiry_date),
        INDEX idx_is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await executeQuery(batchesTable);
    console.log('✅ medicine_batches table created');

    // 6. Insert some sample data for testing
    console.log('Inserting sample data...');
    
    // Sample supplier
    const sampleSupplier = `
      INSERT IGNORE INTO medicine_suppliers (
        supplier_id, name, contact_person, phone, email, address, city, state, pincode
      ) VALUES (
        'SUP001', 'MediCorp Pharmaceuticals', 'Rajesh Kumar', '9876543210', 
        'rajesh@medicorp.com', '123 Medical Street', 'Mumbai', 'Maharashtra', '400001'
      )
    `;
    await executeQuery(sampleSupplier);

    // Sample stock transaction (if medicines exist)
    const medicinesCheck = await executeQuery('SELECT id FROM medicines LIMIT 1');
    if (medicinesCheck.length > 0) {
      const medicineId = medicinesCheck[0].id;
      const sampleTransaction = `
        INSERT IGNORE INTO medicine_stock_transactions (
          transaction_id, medicine_id, transaction_type, quantity, unit_price, 
          total_amount, batch_number, expiry_date, supplier, created_by
        ) VALUES (
          'TXN001', ${medicineId}, 'IN', 100, 25.50, 2550.00, 
          'BATCH001', '2025-12-31', 'MediCorp Pharmaceuticals', 2
        )
      `;
      await executeQuery(sampleTransaction);
      console.log('✅ Sample transaction data inserted');
    }

    console.log('\n🎉 All pharmacy tables created successfully!');
    
    // Verify tables were created
    const tables = await executeQuery('SHOW TABLES');
    console.log('\n📋 Current database tables:');
    tables.forEach(row => {
      const tableName = Object.values(row)[0];
      if (tableName.includes('medicine') || tableName.includes('purchase')) {
        console.log(`✅ ${tableName}`);
      }
    });

  } catch (error) {
    console.error('❌ Error creating pharmacy tables:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
createPharmacyTables();
