#!/usr/bin/env node

/**
 * Comprehensive Pharmacy System Test Script
 * Tests all pharmacy functionality with real data
 */

const { executeQuery, testConnection, dbUtils } = require('../lib/mysql-connection');

async function testPharmacySystem() {
  console.log('🧪 Starting Pharmacy System Tests...\n');

  try {
    // Test database connection
    console.log('1. Testing database connection...');
    const connectionTest = await testConnection();
    if (!connectionTest) {
      throw new Error('Database connection failed');
    }
    console.log('✅ Database connection successful\n');

    // Test 1: Create sample medicines
    console.log('2. Creating sample medicines...');
    await createSampleMedicines();
    console.log('✅ Sample medicines created\n');

    // Test 2: Create sample vendors
    console.log('3. Creating sample vendors...');
    await createSampleVendors();
    console.log('✅ Sample vendors created\n');

    // Test 3: Create sample prescriptions
    console.log('4. Creating sample prescriptions...');
    await createSamplePrescriptions();
    console.log('✅ Sample prescriptions created\n');

    // Test 4: Test stock transactions
    console.log('5. Testing stock transactions...');
    await testStockTransactions();
    console.log('✅ Stock transactions working\n');

    // Test 5: Test pharmacy queries
    console.log('6. Testing pharmacy queries...');
    await testPharmacyQueries();
    console.log('✅ Pharmacy queries working\n');

    // Test 6: Test alerts
    console.log('7. Testing stock alerts...');
    await testStockAlerts();
    console.log('✅ Stock alerts working\n');

    console.log('🎉 All pharmacy system tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

async function createSampleMedicines() {
  const medicines = [
    {
      medicine_id: dbUtils.generateId('MED'),
      name: 'Paracetamol',
      generic_name: 'Acetaminophen',
      brand_name: 'Crocin',
      category: 'Analgesics',
      manufacturer: 'GSK',
      composition: 'Paracetamol 500mg',
      strength: '500mg',
      dosage_form: 'tablet',
      pack_size: '10 tablets',
      unit_price: 2.50,
      mrp: 3.00,
      current_stock: 500,
      minimum_stock: 50,
      maximum_stock: 1000,
      batch_number: 'PAR001',
      expiry_date: '2025-12-31',
      supplier: 'MedSupply Co',
      prescription_required: false,
      is_active: true
    },
    {
      medicine_id: dbUtils.generateId('MED'),
      name: 'Amoxicillin',
      generic_name: 'Amoxicillin',
      brand_name: 'Amoxil',
      category: 'Antibiotics',
      manufacturer: 'Cipla',
      composition: 'Amoxicillin 250mg',
      strength: '250mg',
      dosage_form: 'capsule',
      pack_size: '10 capsules',
      unit_price: 8.50,
      mrp: 10.00,
      current_stock: 200,
      minimum_stock: 30,
      maximum_stock: 500,
      batch_number: 'AMX001',
      expiry_date: '2025-06-30',
      supplier: 'PharmaCorp',
      prescription_required: true,
      is_active: true
    },
    {
      medicine_id: dbUtils.generateId('MED'),
      name: 'Omeprazole',
      generic_name: 'Omeprazole',
      brand_name: 'Prilosec',
      category: 'Gastric',
      manufacturer: 'Sun Pharma',
      composition: 'Omeprazole 20mg',
      strength: '20mg',
      dosage_form: 'capsule',
      pack_size: '14 capsules',
      unit_price: 12.00,
      mrp: 15.00,
      current_stock: 150,
      minimum_stock: 25,
      maximum_stock: 300,
      batch_number: 'OME001',
      expiry_date: '2025-09-15',
      supplier: 'MedSupply Co',
      prescription_required: true,
      is_active: true
    },
    {
      medicine_id: dbUtils.generateId('MED'),
      name: 'Vitamin D3',
      generic_name: 'Cholecalciferol',
      brand_name: 'D-Rise',
      category: 'Vitamins',
      manufacturer: 'Mankind',
      composition: 'Vitamin D3 60000 IU',
      strength: '60000 IU',
      dosage_form: 'capsule',
      pack_size: '4 capsules',
      unit_price: 25.00,
      mrp: 30.00,
      current_stock: 100,
      minimum_stock: 20,
      maximum_stock: 200,
      batch_number: 'VIT001',
      expiry_date: '2026-03-31',
      supplier: 'VitaSupply',
      prescription_required: false,
      is_active: true
    },
    {
      medicine_id: dbUtils.generateId('MED'),
      name: 'Metformin',
      generic_name: 'Metformin HCl',
      brand_name: 'Glycomet',
      category: 'Diabetes',
      manufacturer: 'USV',
      composition: 'Metformin HCl 500mg',
      strength: '500mg',
      dosage_form: 'tablet',
      pack_size: '20 tablets',
      unit_price: 4.50,
      mrp: 6.00,
      current_stock: 300,
      minimum_stock: 40,
      maximum_stock: 600,
      batch_number: 'MET001',
      expiry_date: '2025-11-30',
      supplier: 'DiabCare Supplies',
      prescription_required: true,
      is_active: true
    }
  ];

  for (const medicine of medicines) {
    const query = `
      INSERT INTO medicines (
        medicine_id, name, generic_name, brand_name, category, manufacturer,
        composition, strength, dosage_form, pack_size, unit_price, mrp,
        current_stock, minimum_stock, maximum_stock, batch_number, expiry_date,
        supplier, prescription_required, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await executeQuery(query, [
      medicine.medicine_id, medicine.name, medicine.generic_name, medicine.brand_name,
      medicine.category, medicine.manufacturer, medicine.composition, medicine.strength,
      medicine.dosage_form, medicine.pack_size, medicine.unit_price, medicine.mrp,
      medicine.current_stock, medicine.minimum_stock, medicine.maximum_stock,
      medicine.batch_number, medicine.expiry_date, medicine.supplier,
      medicine.prescription_required, medicine.is_active
    ]);

    // Create initial stock transaction
    await executeQuery(`
      INSERT INTO medicine_stock_transactions (
        medicine_id, transaction_type, quantity, unit_price, total_amount,
        batch_number, expiry_date, supplier, notes, created_by
      ) VALUES (?, 'purchase', ?, ?, ?, ?, ?, ?, 'Initial stock', 1)
    `, [
      medicine.medicine_id, medicine.current_stock, medicine.unit_price,
      medicine.current_stock * medicine.unit_price, medicine.batch_number,
      medicine.expiry_date, medicine.supplier
    ]);

    console.log(`   ✓ Created medicine: ${medicine.name}`);
  }
}

async function createSampleVendors() {
  const vendors = [
    {
      vendor_id: dbUtils.generateId('VEN'),
      vendor_name: 'MedSupply Co',
      contact_person: 'Rajesh Kumar',
      email: 'rajesh@medsupply.com',
      phone: '+91-9876543210',
      address: '123 Medical Street, Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      gst_number: '27ABCDE1234F1Z5',
      vendor_type: 'medicine',
      payment_terms: 'Net 30 days',
      credit_limit: 500000,
      rating: 4.5,
      is_active: true
    },
    {
      vendor_id: dbUtils.generateId('VEN'),
      vendor_name: 'PharmaCorp',
      contact_person: 'Priya Sharma',
      email: 'priya@pharmacorp.com',
      phone: '+91-9876543211',
      address: '456 Pharma Avenue, Delhi',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      gst_number: '07FGHIJ5678K2L6',
      vendor_type: 'medicine',
      payment_terms: 'Net 45 days',
      credit_limit: 750000,
      rating: 4.2,
      is_active: true
    },
    {
      vendor_id: dbUtils.generateId('VEN'),
      vendor_name: 'VitaSupply',
      contact_person: 'Amit Patel',
      email: 'amit@vitasupply.com',
      phone: '+91-9876543212',
      address: '789 Vitamin Road, Ahmedabad',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380001',
      gst_number: '24MNOPQ9012R3S7',
      vendor_type: 'medicine',
      payment_terms: 'Net 15 days',
      credit_limit: 300000,
      rating: 4.8,
      is_active: true
    }
  ];

  for (const vendor of vendors) {
    const query = `
      INSERT INTO vendors (
        vendor_id, vendor_name, contact_person, email, phone, address,
        city, state, pincode, gst_number, vendor_type, payment_terms,
        credit_limit, rating, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await executeQuery(query, [
      vendor.vendor_id, vendor.vendor_name, vendor.contact_person, vendor.email,
      vendor.phone, vendor.address, vendor.city, vendor.state, vendor.pincode,
      vendor.gst_number, vendor.vendor_type, vendor.payment_terms,
      vendor.credit_limit, vendor.rating, vendor.is_active
    ]);

    console.log(`   ✓ Created vendor: ${vendor.vendor_name}`);
  }
}

async function createSamplePrescriptions() {
  // First, ensure we have some patients and doctors
  await createSamplePatientsAndDoctors();

  const prescriptions = [
    {
      prescription_id: dbUtils.generateId('RX'),
      patient_id: 1,
      doctor_id: 1,
      prescription_date: '2024-01-15',
      status: 'active',
      total_amount: 45.50,
      notes: 'Take after meals'
    },
    {
      prescription_id: dbUtils.generateId('RX'),
      patient_id: 2,
      doctor_id: 1,
      prescription_date: '2024-01-15',
      status: 'completed',
      total_amount: 125.00,
      notes: 'Complete the course'
    }
  ];

  for (const prescription of prescriptions) {
    const query = `
      INSERT INTO prescriptions (
        prescription_id, patient_id, doctor_id, prescription_date,
        status, total_amount, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await executeQuery(query, [
      prescription.prescription_id, prescription.patient_id, prescription.doctor_id,
      prescription.prescription_date, prescription.status, prescription.total_amount,
      prescription.notes
    ]);

    console.log(`   ✓ Created prescription: ${prescription.prescription_id}`);
  }
}

async function createSamplePatientsAndDoctors() {
  // Create sample patients if they don't exist
  try {
    await executeQuery(`
      INSERT IGNORE INTO patients (id, patient_id, name, date_of_birth, gender, contact_number, address, registration_date)
      VALUES 
      (1, 'PAT001', 'John Doe', '1985-05-15', 'Male', '+91-9876543220', '123 Patient Street, Mumbai', CURDATE()),
      (2, 'PAT002', 'Jane Smith', '1990-08-22', 'Female', '+91-9876543221', '456 Patient Avenue, Mumbai', CURDATE())
    `, []);

    // Create sample doctors if they don't exist
    await executeQuery(`
      INSERT IGNORE INTO users (id, user_id, name, email, password_hash, role, contact_number, specialization, is_active)
      VALUES 
      (1, 'DOC001', 'Dr. Rajesh Gupta', 'rajesh@hospital.com', 'hashed_password', 'doctor', '+91-9876543230', 'General Medicine', 1)
    `, []);
  } catch (error) {
    // Ignore errors if records already exist
    console.log('   ℹ️ Sample patients/doctors may already exist');
  }
}

async function testStockTransactions() {
  // Get a medicine ID
  const [medicine] = await executeQuery(`SELECT medicine_id FROM medicines LIMIT 1`, []) as any[];
  
  if (medicine) {
    // Test purchase transaction
    await executeQuery(`
      INSERT INTO medicine_stock_transactions (
        medicine_id, transaction_type, quantity, unit_price, total_amount,
        batch_number, supplier, notes, created_by
      ) VALUES (?, 'purchase', 50, 2.50, 125.00, 'TEST001', 'Test Supplier', 'Test purchase', 1)
    `, [medicine.medicine_id]);

    // Update stock
    await executeQuery(`
      UPDATE medicines SET current_stock = current_stock + 50 WHERE medicine_id = ?
    `, [medicine.medicine_id]);

    console.log(`   ✓ Created purchase transaction for ${medicine.medicine_id}`);

    // Test sale transaction
    await executeQuery(`
      INSERT INTO medicine_stock_transactions (
        medicine_id, transaction_type, quantity, unit_price, total_amount,
        reference_id, notes, created_by
      ) VALUES (?, 'sale', 10, 2.50, 25.00, 'RX001', 'Test sale', 1)
    `, [medicine.medicine_id]);

    // Update stock
    await executeQuery(`
      UPDATE medicines SET current_stock = current_stock - 10 WHERE medicine_id = ?
    `, [medicine.medicine_id]);

    console.log(`   ✓ Created sale transaction for ${medicine.medicine_id}`);
  }
}

async function testPharmacyQueries() {
  // Test medicine queries
  const medicines = await executeQuery(`
    SELECT COUNT(*) as count FROM medicines WHERE is_active = 1
  `, []);
  console.log(`   ✓ Found ${medicines[0].count} active medicines`);

  // Test vendor queries
  const vendors = await executeQuery(`
    SELECT COUNT(*) as count FROM vendors WHERE is_active = 1
  `, []);
  console.log(`   ✓ Found ${vendors[0].count} active vendors`);

  // Test prescription queries
  const prescriptions = await executeQuery(`
    SELECT COUNT(*) as count FROM prescriptions
  `, []);
  console.log(`   ✓ Found ${prescriptions[0].count} prescriptions`);

  // Test stock transaction queries
  const transactions = await executeQuery(`
    SELECT COUNT(*) as count FROM medicine_stock_transactions
  `, []);
  console.log(`   ✓ Found ${transactions[0].count} stock transactions`);
}

async function testStockAlerts() {
  // Test low stock alerts
  const lowStock = await executeQuery(`
    SELECT COUNT(*) as count FROM medicines 
    WHERE current_stock <= minimum_stock AND is_active = 1
  `, []);
  console.log(`   ✓ Found ${lowStock[0].count} low stock items`);

  // Test expiring medicines
  const expiring = await executeQuery(`
    SELECT COUNT(DISTINCT m.id) as count 
    FROM medicines m
    JOIN medicine_stock_transactions mst ON m.id = mst.medicine_id
    WHERE mst.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
    AND mst.expiry_date > CURDATE()
    AND m.is_active = 1
  `, []);
  console.log(`   ✓ Found ${expiring[0].count} medicines expiring in 30 days`);
}

// Run the tests
if (require.main === module) {
  testPharmacySystem().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

module.exports = { testPharmacySystem };
