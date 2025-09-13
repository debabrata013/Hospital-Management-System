#!/usr/bin/env node

const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'srv2047.hstgr.io',
  user: 'u153229971_admin',
  password: 'Admin!2025',
  database: 'u153229971_Hospital',
  port: 3306
};

async function addMedicines() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('💊 Adding medicines to database...\n');

    // First, let's check the medicines table structure
    const [columns] = await connection.execute('DESCRIBE medicines');
    console.log('📋 Medicines table structure:');
    columns.forEach(col => {
      console.log(`   ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
    });

    // Sample medicines to add
    const medicinesToAdd = [
      {
        medicine_id: 'MED011',
        name: 'Insulin Glargine',
        generic_name: 'Insulin Glargine',
        brand_name: 'Lantus',
        category: 'Antidiabetic',
        manufacturer: 'Sanofi',
        composition: 'Insulin Glargine 100 IU/ml',
        strength: '100 IU/ml',
        dosage_form: 'injection',
        pack_size: '10ml vial',
        unit_price: 450.00,
        mrp: 500.00,
        current_stock: 25,
        minimum_stock: 10,
        maximum_stock: 100,
        expiry_date: '2026-12-31',
        batch_number: 'INS2025001',
        supplier: 'Sanofi India',
        storage_conditions: 'Store in refrigerator at 2-8°C',
        side_effects: 'Hypoglycemia, weight gain',
        contraindications: 'Hypersensitivity to insulin',
        drug_interactions: 'Beta-blockers, alcohol',
        pregnancy_category: 'B',
        prescription_required: 1,
        is_active: 1
      },
      {
        medicine_id: 'MED012',
        name: 'Epinephrine',
        generic_name: 'Epinephrine',
        brand_name: 'Adrenaline',
        category: 'Emergency Medicine',
        manufacturer: 'Pfizer',
        composition: 'Epinephrine 1mg/ml',
        strength: '1mg/ml',
        dosage_form: 'injection',
        pack_size: '1ml ampoule',
        unit_price: 180.00,
        mrp: 200.00,
        current_stock: 15,
        minimum_stock: 5,
        maximum_stock: 50,
        expiry_date: '2026-06-30',
        batch_number: 'EPI2025001',
        supplier: 'Pfizer India',
        storage_conditions: 'Store at room temperature, protect from light',
        side_effects: 'Palpitations, hypertension, anxiety',
        contraindications: 'Hypertension, cardiac arrhythmias',
        drug_interactions: 'Beta-blockers, MAO inhibitors',
        pregnancy_category: 'C',
        prescription_required: 1,
        is_active: 1
      },
      {
        medicine_id: 'MED013',
        name: 'Morphine',
        generic_name: 'Morphine Sulfate',
        brand_name: 'Morphine',
        category: 'Opioid Analgesic',
        manufacturer: 'Sun Pharma',
        composition: 'Morphine Sulfate 10mg/ml',
        strength: '10mg/ml',
        dosage_form: 'injection',
        pack_size: '1ml ampoule',
        unit_price: 25.00,
        mrp: 30.00,
        current_stock: 30,
        minimum_stock: 10,
        maximum_stock: 100,
        expiry_date: '2026-03-15',
        batch_number: 'MOR2025001',
        supplier: 'Sun Pharma',
        storage_conditions: 'Store in controlled room temperature',
        side_effects: 'Respiratory depression, constipation, sedation',
        contraindications: 'Respiratory depression, head injury',
        drug_interactions: 'CNS depressants, alcohol',
        pregnancy_category: 'C',
        prescription_required: 1,
        is_active: 1
      },
      {
        medicine_id: 'MED014',
        name: 'Atorvastatin',
        generic_name: 'Atorvastatin Calcium',
        brand_name: 'Lipitor',
        category: 'Antilipemic',
        manufacturer: 'Pfizer',
        composition: 'Atorvastatin Calcium 20mg',
        strength: '20mg',
        dosage_form: 'tablet',
        pack_size: '30 tablets',
        unit_price: 8.50,
        mrp: 12.00,
        current_stock: 200,
        minimum_stock: 50,
        maximum_stock: 500,
        expiry_date: '2026-08-20',
        batch_number: 'ATO2025001',
        supplier: 'Pfizer India',
        storage_conditions: 'Store at room temperature',
        side_effects: 'Muscle pain, liver enzyme elevation',
        contraindications: 'Active liver disease, pregnancy',
        drug_interactions: 'Warfarin, grapefruit juice',
        pregnancy_category: 'X',
        prescription_required: 1,
        is_active: 1
      },
      {
        medicine_id: 'MED015',
        name: 'Losartan',
        generic_name: 'Losartan Potassium',
        brand_name: 'Cozaar',
        category: 'Antihypertensive',
        manufacturer: 'Merck',
        composition: 'Losartan Potassium 50mg',
        strength: '50mg',
        dosage_form: 'tablet',
        pack_size: '30 tablets',
        unit_price: 6.00,
        mrp: 8.50,
        current_stock: 150,
        minimum_stock: 30,
        maximum_stock: 300,
        expiry_date: '2026-05-10',
        batch_number: 'LOS2025001',
        supplier: 'Merck India',
        storage_conditions: 'Store at room temperature',
        side_effects: 'Dizziness, hyperkalemia',
        contraindications: 'Pregnancy, bilateral renal artery stenosis',
        drug_interactions: 'Potassium supplements, NSAIDs',
        pregnancy_category: 'D',
        prescription_required: 1,
        is_active: 1
      }
    ];

    console.log('\n🔧 Adding medicines...\n');

    for (const med of medicinesToAdd) {
      try {
        // Check if medicine already exists
        const [existing] = await connection.execute(
          'SELECT id FROM medicines WHERE medicine_id = ?',
          [med.medicine_id]
        );

        if (existing.length > 0) {
          console.log(`⚠️  ${med.name} (${med.medicine_id}) already exists, skipping...`);
          continue;
        }

        // Insert new medicine
        await connection.execute(`
          INSERT INTO medicines (
            medicine_id, name, generic_name, brand_name, category, manufacturer,
            composition, strength, dosage_form, pack_size, unit_price, mrp,
            current_stock, minimum_stock, maximum_stock, expiry_date, batch_number,
            supplier, storage_conditions, side_effects, contraindications,
            drug_interactions, pregnancy_category, prescription_required, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          med.medicine_id, med.name, med.generic_name, med.brand_name, med.category,
          med.manufacturer, med.composition, med.strength, med.dosage_form, med.pack_size,
          med.unit_price, med.mrp, med.current_stock, med.minimum_stock, med.maximum_stock,
          med.expiry_date, med.batch_number, med.supplier, med.storage_conditions,
          med.side_effects, med.contraindications, med.drug_interactions,
          med.pregnancy_category, med.prescription_required, med.is_active
        ]);

        console.log(`✅ Added ${med.name} (${med.medicine_id})`);
        console.log(`   Category: ${med.category}`);
        console.log(`   Strength: ${med.strength}`);
        console.log(`   Stock: ${med.current_stock} units`);
        console.log(`   Price: ₹${med.unit_price}`);
        console.log(`   Expiry: ${med.expiry_date}`);
        console.log('');

      } catch (error) {
        console.log(`❌ Error adding ${med.name}: ${error.message}`);
      }
    }

    // Show updated inventory summary
    console.log('📊 Updated Inventory Summary:');
    const [allMedicines] = await connection.execute('SELECT * FROM medicines WHERE is_active = 1');
    
    let totalItems = 0;
    let totalValue = 0;
    let criticalStock = 0;
    let expiringSoon = 0;

    allMedicines.forEach(med => {
      const qty = parseInt(med.current_stock || 0);
      const price = parseFloat(med.unit_price || 0);
      
      totalItems += qty;
      totalValue += qty * price;
      
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
    });

    console.log(`📦 Total Items: ${totalItems.toLocaleString()}`);
    console.log(`⚠️  Critical Stock: ${criticalStock.toLocaleString()}`);
    console.log(`📅 Expiring Soon: ${expiringSoon.toLocaleString()}`);
    console.log(`💰 Total Value: ₹${totalValue.toLocaleString()}`);
    console.log(`💊 Total Medicines: ${allMedicines.length}`);

    await connection.end();
    console.log('\n✅ Medicines added successfully!');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

addMedicines();
