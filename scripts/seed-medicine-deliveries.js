
require('dotenv').config({ path: './.env.local' });
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
};

async function seedMedicineDeliveries() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to the database.');

    // 1. Get a valid patient with an active room assignment
    const [activeAssignments] = await connection.execute(
      `SELECT patient_id FROM room_assignments WHERE status = 'Active' LIMIT 1`
    );
    if (activeAssignments.length === 0) {
      console.error('❌ No active patient assignments found. Cannot seed medicine deliveries.');
      console.log('Please assign a patient to a room first.');
      return;
    }
    const patientId = activeAssignments[0].patient_id;
    console.log(`✅ Found active patient ID: ${patientId}`);

    // 2. Get a valid medicine
    const [medicines] = await connection.execute(`SELECT id FROM medicines LIMIT 1`);
    if (medicines.length === 0) {
      console.error('❌ No medicines found in the database. Cannot seed data.');
      return;
    }
    const medicineId = medicines[0].id;
    console.log(`✅ Found medicine ID: ${medicineId}`);

    // 3. Get a valid doctor (user with 'doctor' role)
    const [doctors] = await connection.execute(`SELECT id FROM users WHERE role = 'doctor' LIMIT 1`);
    if (doctors.length === 0) {
      console.error('❌ No doctors found in the database. Cannot seed data.');
      return;
    }
    const prescriberId = doctors[0].id;
    console.log(`✅ Found prescriber (doctor) ID: ${prescriberId}`);

    // 4. Define sample delivery records
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    const deliveries = [
      {
        patient_id: patientId,
        medicine_id: medicineId,
        dosage: '500 mg',
        route: 'Oral',
        frequency: 'Twice a day',
        scheduled_time: '09:00:00',
        scheduled_date: todayString,
        status: 'pending',
        prescribed_by: prescriberId,
        notes: 'Take after breakfast.',
        priority: 'normal'
      },
      {
        patient_id: patientId,
        medicine_id: medicineId,
        dosage: '500 mg',
        route: 'Oral',
        frequency: 'Twice a day',
        scheduled_time: '21:00:00',
        scheduled_date: todayString,
        status: 'pending',
        prescribed_by: prescriberId,
        notes: 'Take after dinner.',
        priority: 'high'
      }
    ];

    // 5. Insert the records
    console.log('🌱 Inserting seed data into medicine_deliveries...');
    for (const delivery of deliveries) {
        const query = `INSERT INTO medicine_deliveries (patient_id, medicine_id, dosage, route, frequency, scheduled_time, scheduled_date, status, prescribed_by, notes, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        await connection.execute(query, Object.values(delivery));
    }

    console.log('✅ Successfully seeded medicine_deliveries table with 2 records.');

  } catch (error) {
    console.error('❌ Error seeding medicine deliveries:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed.');
    }
  }
}

seedMedicineDeliveries();
