#!/usr/bin/env node

const { executeQuery, dbUtils } = require('../lib/mysql-connection');

async function addSampleData() {
  console.log('📦 Adding sample pharmacy data...\n');

  try {
    await addSampleMedicines();
    await addSampleVendors();
    console.log('\n✅ Sample data added successfully!');
  } catch (error) {
    console.error('❌ Error adding sample data:', error.message);
  }
}

async function addSampleMedicines() {
  const medicines = [
    {
      name: 'Paracetamol 500mg',
      generic_name: 'Acetaminophen',
      category: 'Analgesics',
      manufacturer: 'GSK',
      unit_price: 2.50,
      mrp: 3.00,
      current_stock: 500,
      minimum_stock: 50
    },
    {
      name: 'Amoxicillin 250mg',
      generic_name: 'Amoxicillin',
      category: 'Antibiotics',
      manufacturer: 'Cipla',
      unit_price: 8.50,
      mrp: 10.00,
      current_stock: 200,
      minimum_stock: 30
    },
    {
      name: 'Omeprazole 20mg',
      generic_name: 'Omeprazole',
      category: 'Gastric',
      manufacturer: 'Sun Pharma',
      unit_price: 12.00,
      mrp: 15.00,
      current_stock: 150,
      minimum_stock: 25
    }
  ];

  for (const med of medicines) {
    try {
      await executeQuery(`
        INSERT IGNORE INTO medicines (
          medicine_id, name, generic_name, category, manufacturer,
          unit_price, mrp, current_stock, minimum_stock, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `, [
        dbUtils.generateId('MED'),
        med.name, med.generic_name, med.category, med.manufacturer,
        med.unit_price, med.mrp, med.current_stock, med.minimum_stock
      ]);
      console.log(`✓ Added medicine: ${med.name}`);
    } catch (error) {
      console.log(`⚠️ Medicine ${med.name}:`, error.message);
    }
  }
}

async function addSampleVendors() {
  const vendors = [
    {
      vendor_name: 'MedSupply Co',
      contact_person: 'Rajesh Kumar',
      phone: '+91-9876543210',
      email: 'rajesh@medsupply.com',
      vendor_type: 'medicine'
    },
    {
      vendor_name: 'PharmaCorp',
      contact_person: 'Priya Sharma',
      phone: '+91-9876543211',
      email: 'priya@pharmacorp.com',
      vendor_type: 'medicine'
    }
  ];

  for (const vendor of vendors) {
    try {
      await executeQuery(`
        INSERT IGNORE INTO vendors (
          vendor_id, vendor_name, contact_person, phone, email, vendor_type, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, 1)
      `, [
        dbUtils.generateId('VEN'),
        vendor.vendor_name, vendor.contact_person, vendor.phone, vendor.email, vendor.vendor_type
      ]);
      console.log(`✓ Added vendor: ${vendor.vendor_name}`);
    } catch (error) {
      console.log(`⚠️ Vendor ${vendor.vendor_name}:`, error.message);
    }
  }
}

addSampleData();
