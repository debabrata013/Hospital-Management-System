const mysql = require('mysql2/promise');

async function addDepartmentColumn() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hospital_db',
      port: process.env.DB_PORT || 3306
    });

    console.log('🔍 Checking appointments table structure...\n');

    // Check current table structure
    const [columns] = await connection.execute('DESCRIBE appointments');
    console.log('📋 Current appointments table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(Required)' : '(Optional)'}`);
    });

    // Check if department column already exists
    const departmentExists = columns.some(col => col.Field === 'department');
    
    if (departmentExists) {
      console.log('\n✅ Department column already exists!');
    } else {
      console.log('\n🔧 Adding department column...');
      
      // Add department column
      await connection.execute(`
        ALTER TABLE appointments 
        ADD COLUMN department VARCHAR(100) NULL AFTER doctor_id
      `);
      
      console.log('✅ Department column added successfully!');
      
      // Update existing appointments with default department based on doctor
      console.log('🔄 Updating existing appointments with department info...');
      
      await connection.execute(`
        UPDATE appointments a
        JOIN users u ON a.doctor_id = u.id
        SET a.department = COALESCE(u.department, 'General Medicine')
        WHERE a.department IS NULL
      `);
      
      console.log('✅ Existing appointments updated with department info!');
    }

    // Show updated table structure
    console.log('\n📋 Updated appointments table structure:');
    const [updatedColumns] = await connection.execute('DESCRIBE appointments');
    updatedColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(Required)' : '(Optional)'}`);
    });

    // Show sample data
    console.log('\n📊 Sample appointments with department:');
    const [sampleData] = await connection.execute(`
      SELECT 
        a.appointment_id,
        p.name as patient_name,
        u.name as doctor_name,
        a.department,
        a.appointment_date,
        a.status
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u ON a.doctor_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 5
    `);

    if (sampleData.length === 0) {
      console.log('  No appointments found');
    } else {
      sampleData.forEach(apt => {
        console.log(`  ${apt.appointment_id}: ${apt.patient_name} → Dr. ${apt.doctor_name} (${apt.department}) - ${apt.appointment_date} [${apt.status}]`);
      });
    }

    await connection.end();
    console.log('\n✅ Department column setup completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addDepartmentColumn();
