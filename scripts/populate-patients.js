require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306')
};

const samplePatients = [
  {
    patient_id: 'P001',
    name: 'Ram Sharma',
    email: 'ram.sharma@example.com',
    contact_number: '9876543210',
    date_of_birth: '1985-05-15',
    gender: 'Male',
    address: '123 Main St',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110001',
    blood_group: 'O+',
    emergency_contact_name: 'Sita Sharma',
    emergency_contact_number: '9876543211',
    medical_history: 'None',
    allergies: 'None',
    current_medications: 'None',
  },
  {
    patient_id: 'P002',
    name: 'Sunita Devi',
    email: 'sunita.devi@example.com',
    contact_number: '9876543212',
    date_of_birth: '1990-08-22',
    gender: 'Female',
    address: '456 Park Avenue',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    blood_group: 'A+',
    emergency_contact_name: 'Anil Devi',
    emergency_contact_number: '9876543213',
    medical_history: 'None',
    allergies: 'Pollen',
    current_medications: 'None',
  },
  {
    patient_id: 'P003',
    name: 'Ajay Kumar',
    email: 'ajay.kumar@example.com',
    contact_number: '9876543214',
    date_of_birth: '1978-11-30',
    gender: 'Male',
    address: '789 Lake Side',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
    blood_group: 'B+',
    emergency_contact_name: 'Priya Kumar',
    emergency_contact_number: '9876543215',
    medical_history: 'Hypertension',
    allergies: 'None',
    current_medications: 'Amlodipine',
  },
    {
    patient_id: 'P004',
    name: 'Geeta Sharma',
    email: 'geeta.sharma@example.com',
    contact_number: '9876543216',
    date_of_birth: '1995-02-20',
    gender: 'Female',
    address: '101 River View',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    blood_group: 'AB+',
    emergency_contact_name: 'Vijay Sharma',
    emergency_contact_number: '9876543217',
    medical_history: 'None',
    allergies: 'None',
    current_medications: 'None',
  },
];

async function populatePatients() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to the database.');

    const query = `
      INSERT INTO patients 
      (patient_id, name, email, contact_number, date_of_birth, gender, address, city, state, pincode, blood_group, emergency_contact_name, emergency_contact_number, medical_history, allergies, current_medications)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    for (const patient of samplePatients) {
      await connection.execute(query, [
        patient.patient_id,
        patient.name,
        patient.email,
        patient.contact_number,
        patient.date_of_birth,
        patient.gender,
        patient.address,
        patient.city,
        patient.state,
        patient.pincode,
        patient.blood_group,
        patient.emergency_contact_name,
        patient.emergency_contact_number,
        patient.medical_history,
        patient.allergies,
        patient.current_medications,
      ]);
    }

    console.log(`✅ Successfully inserted ${samplePatients.length} sample patients.`);

  } catch (error) {
    console.error('❌ Error populating patients:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed.');
    }
  }
}

populatePatients();
