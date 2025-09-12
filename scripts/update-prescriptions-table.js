const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function updatePrescriptionsTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log('Checking prescriptions table structure...');

    // Check current table structure
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'prescriptions'
    `, [process.env.DB_NAME]);

    const existingColumns = columns.map(col => col.COLUMN_NAME);
    console.log('Existing columns:', existingColumns);

    // Required columns for new prescription system
    const requiredColumns = [
      'prescription_id',
      'appointment_id', 
      'blood_pressure',
      'heart_rate',
      'temperature',
      'weight',
      'height',
      'medicines',
      'remarks',
      'prescription_date'
    ];

    // Add missing columns
    for (const column of requiredColumns) {
      if (!existingColumns.includes(column)) {
        console.log(`Adding missing column: ${column}`);
        
        let alterQuery = '';
        switch (column) {
          case 'prescription_id':
            alterQuery = 'ALTER TABLE prescriptions ADD COLUMN prescription_id VARCHAR(50) UNIQUE';
            break;
          case 'appointment_id':
            alterQuery = 'ALTER TABLE prescriptions ADD COLUMN appointment_id INT NULL, ADD FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL';
            break;
          case 'blood_pressure':
            alterQuery = 'ALTER TABLE prescriptions ADD COLUMN blood_pressure VARCHAR(20) NULL';
            break;
          case 'heart_rate':
            alterQuery = 'ALTER TABLE prescriptions ADD COLUMN heart_rate VARCHAR(10) NULL';
            break;
          case 'temperature':
            alterQuery = 'ALTER TABLE prescriptions ADD COLUMN temperature VARCHAR(10) NULL';
            break;
          case 'weight':
            alterQuery = 'ALTER TABLE prescriptions ADD COLUMN weight VARCHAR(10) NULL';
            break;
          case 'height':
            alterQuery = 'ALTER TABLE prescriptions ADD COLUMN height VARCHAR(10) NULL';
            break;
          case 'medicines':
            alterQuery = 'ALTER TABLE prescriptions ADD COLUMN medicines JSON NOT NULL';
            break;
          case 'remarks':
            alterQuery = 'ALTER TABLE prescriptions ADD COLUMN remarks TEXT NULL';
            break;
          case 'prescription_date':
            alterQuery = 'ALTER TABLE prescriptions ADD COLUMN prescription_date DATE NOT NULL DEFAULT (CURDATE())';
            break;
        }
        
        if (alterQuery) {
          try {
            await connection.execute(alterQuery);
            console.log(`✅ Added column: ${column}`);
          } catch (error) {
            console.log(`⚠️  Could not add ${column}:`, error.message);
          }
        }
      }
    }

    // Update prescription_id for existing records if needed
    const [emptyPrescriptionIds] = await connection.execute(
      'SELECT COUNT(*) as count FROM prescriptions WHERE prescription_id IS NULL OR prescription_id = ""'
    );
    
    if (emptyPrescriptionIds[0].count > 0) {
      console.log('Updating existing records with prescription IDs...');
      const [existingRecords] = await connection.execute('SELECT id FROM prescriptions WHERE prescription_id IS NULL OR prescription_id = ""');
      
      for (const record of existingRecords) {
        const prescriptionId = `PRESC-${Date.now().toString(36)}${Math.random().toString(36).substr(2, 4)}`.toUpperCase();
        await connection.execute(
          'UPDATE prescriptions SET prescription_id = ? WHERE id = ?',
          [prescriptionId, record.id]
        );
      }
      console.log(`✅ Updated ${existingRecords.length} existing records`);
    }

    console.log('\n🎉 Prescriptions table update completed!');

  } catch (error) {
    console.error('❌ Error updating prescriptions table:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

updatePrescriptionsTable()
  .then(() => {
    console.log('\n✅ Prescriptions table update completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Prescriptions table update failed:', error);
    process.exit(1);
  });
