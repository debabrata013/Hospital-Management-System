require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function populateTasks() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to the database.');

    // Get existing patients
    const [patients] = await connection.execute('SELECT id FROM patients');
    if (patients.length < 3) {
      console.error('❌ Not enough patients in the database. Please run the patient seeder first.');
      return;
    }

    const sampleTasks = [
      {
        patient_id: patients[0].id,
        task: 'Record vital signs',
        description: 'Check blood pressure, pulse, temperature, and oxygen saturation',
        priority: 'normal',
        due_time: '14:00:00',
        due_date: '2024-07-30',
        status: 'pending',
        assigned_by: 2, // Assuming user with ID 2 (a doctor or admin) exists
        category: 'vitals',
        estimated_duration: '15 minutes',
      },
      {
        patient_id: patients[1].id,
        task: 'Administer medication',
        description: 'Give prescribed pain medication - Paracetamol 500mg',
        priority: 'high',
        due_time: '16:00:00',
        due_date: '2024-07-30',
        status: 'pending',
        assigned_by: 2,
        category: 'medication',
        estimated_duration: '10 minutes',
      },
      {
        patient_id: patients[2].id,
        task: 'Wound dressing change',
        description: 'Change surgical wound dressing on left arm',
        priority: 'normal',
        due_time: '18:00:00',
        due_date: '2024-07-30',
        status: 'completed',
        assigned_by: 3, // Assuming user with ID 3 exists
        category: 'care',
        estimated_duration: '20 minutes',
        completed_at: '2024-07-30 17:45:00',
      },
    ];

    const query = `
      INSERT INTO staff_tasks 
      (patient_id, task, description, priority, due_time, due_date, status, assigned_by, category, estimated_duration, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    for (const task of sampleTasks) {
      await connection.execute(query, [
        task.patient_id,
        task.task,
        task.description,
        task.priority,
        task.due_time,
        task.due_date,
        task.status,
        task.assigned_by,
        task.category,
        task.estimated_duration,
        task.completed_at || null,
      ]);
    }

    console.log(`✅ Successfully inserted ${sampleTasks.length} sample tasks.`);

  } catch (error) {
    console.error('❌ Error populating tasks:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed.');
    }
  }
}

populateTasks();
