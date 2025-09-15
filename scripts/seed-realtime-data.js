require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function ensureTables(connection) {
  // Rooms table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL,
      capacity INT NOT NULL DEFAULT 1,
      current_occupancy INT NOT NULL DEFAULT 0,
      status ENUM('active','inactive','maintenance') NOT NULL DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Staff shifts table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS staff_shifts (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      shift_date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      status ENUM('pending','active','completed','starting','ending','cancelled') NOT NULL DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_user_date (user_id, shift_date)
    )
  `);

  // Ensure uniqueness for idempotent upserts
  try {
    await connection.execute(`
      CREATE UNIQUE INDEX ux_staff_shifts_user_date_start ON staff_shifts(user_id, shift_date, start_time)
    `);
  } catch (_) {}
}

async function count(connection, sql, params = []) {
  const [rows] = await connection.execute(sql, params);
  return rows[0]?.count || 0;
}

async function upsertDoctorsAndStaff(connection) {
  const doctorsCount = await count(connection, `SELECT COUNT(*) AS count FROM users WHERE role LIKE '%doctor%' AND is_active = 1`);
  if (doctorsCount === 0) {
    console.log('Seeding doctors...');
    const doctors = [
      { user_id: 'DOC001', name: 'Dr. Priya Sharma', email: 'priya.sharma@example.com' },
      { user_id: 'DOC002', name: 'Dr. Amit Patel', email: 'amit.patel@example.com' }
    ];
    for (const d of doctors) {
      await connection.execute(`
        INSERT IGNORE INTO users (user_id, name, email, password_hash, role, contact_number, is_active)
        VALUES (?, ?, ?, ?, 'doctor', ?, 1)
      `, [d.user_id, d.name, d.email, '$2a$10$examplehashDOCTOR123456789012345678901234567890', '+911234567890']);
    }
  }

  const staffCount = await count(connection, `SELECT COUNT(*) AS count FROM users WHERE role NOT LIKE '%patient%' AND role NOT LIKE '%doctor%' AND is_active = 1`);
  if (staffCount === 0) {
    console.log('Seeding staff...');
    const staff = [
      { user_id: 'NUR001', name: 'Nurse Ravi Kumar', email: 'ravi.kumar@example.com', role: 'staff' },
      { user_id: 'REC001', name: 'Reception Meera', email: 'meera.patel@example.com', role: 'receptionist' }
    ];
    for (const s of staff) {
      await connection.execute(`
        INSERT IGNORE INTO users (user_id, name, email, password_hash, role, contact_number, is_active)
        VALUES (?, ?, ?, ?, ?, ?, 1)
      `, [s.user_id, s.name, s.email, '$2a$10$examplehashSTAFF123456789012345678901234567890', s.role, '+919876543210']);
    }
  }
}

async function upsertPatients(connection) {
  const patientsCount = await count(connection, `SELECT COUNT(*) AS count FROM patients WHERE is_active = 1`);
  if (patientsCount === 0) {
    console.log('Seeding patients...');
    const patients = [
      { patient_id: 'PAT001', name: 'Ramesh Kumar', gender: 'Male', contact: '+910000000001' },
      { patient_id: 'PAT002', name: 'Sita Devi', gender: 'Female', contact: '+910000000002' }
    ];
    for (const p of patients) {
      await connection.execute(`
        INSERT IGNORE INTO patients (
          patient_id, name, date_of_birth, gender, contact_number, address, emergency_contact_name, emergency_contact_number, is_active, registration_date
        ) VALUES (?, ?, DATE_SUB(CURDATE(), INTERVAL 30 YEAR), ?, ?, 'City Center', 'Family', ?, 1, CURDATE())
      `, [p.patient_id, p.name, p.gender, p.contact, p.contact]);
    }
  }
}

async function upsertRooms(connection) {
  const roomsCount = await count(connection, `SELECT COUNT(*) AS count FROM rooms`);
  if (roomsCount === 0) {
    console.log('Seeding rooms...');
    const rooms = [
      { name: 'Room 101', capacity: 2, current_occupancy: 0 },
      { name: 'Room 205', capacity: 1, current_occupancy: 1 },
      { name: 'OT-1', capacity: 1, current_occupancy: 1 }
    ];
    for (const r of rooms) {
      await connection.execute(`
        INSERT INTO rooms (name, capacity, current_occupancy, status)
        VALUES (?, ?, ?, 'active')
      `, [r.name, r.capacity, r.current_occupancy]);
    }
  }
}

async function upsertShifts(connection) {
  console.log('Seeding shifts for today...');
  const [doctorRows] = await connection.execute(`SELECT id FROM users WHERE role LIKE '%doctor%' AND is_active = 1 LIMIT 2`);
  const [staffRows] = await connection.execute(`SELECT id FROM users WHERE role NOT LIKE '%patient%' AND role NOT LIKE '%doctor%' AND is_active = 1 LIMIT 2`);
  const today = new Date();
  const toDate = (d) => d.toISOString().split('T')[0];
  const dateStr = toDate(today);

  const entries = [];
  if (doctorRows.length > 0) entries.push({ user_id: doctorRows[0].id, start: '08:00:00', end: '16:00:00' });
  if (doctorRows.length > 1) entries.push({ user_id: doctorRows[1].id, start: '12:00:00', end: '20:00:00' });
  if (staffRows.length > 0) entries.push({ user_id: staffRows[0].id, start: '08:00:00', end: '20:00:00' });
  if (staffRows.length > 1) entries.push({ user_id: staffRows[1].id, start: '07:00:00', end: '15:00:00' });

  for (const e of entries) {
    await connection.execute(`
      INSERT INTO staff_shifts (user_id, shift_date, start_time, end_time, status)
      VALUES (?, ?, ?, ?, 'active')
      ON DUPLICATE KEY UPDATE end_time = VALUES(end_time), status = 'active'
    `, [e.user_id, dateStr, e.start, e.end]);
  }
}

async function upsertAppointments(connection) {
  console.log('Seeding today appointments...');
  const [patientRows] = await connection.execute(`SELECT id FROM patients ORDER BY id LIMIT 5`);
  const [doctorRows] = await connection.execute(`SELECT id FROM users WHERE role LIKE '%doctor%' AND is_active = 1 ORDER BY id LIMIT 2`);
  if (patientRows.length && doctorRows.length) {
    // Compute next numeric suffix from existing IDs
    const [maxRow] = await connection.execute(`
      SELECT IFNULL(MAX(CAST(SUBSTRING(appointment_id, 4) AS UNSIGNED)), 0) AS max_num FROM appointments
    `);
    let nextNum = (maxRow[0]?.max_num || 0) + 1;
    for (let i = 0; i < Math.min(5, patientRows.length); i++) {
      const time = `${String(9 + i).padStart(2, '0')}:00:00`;
      const aptId = `APT${String(nextNum++).padStart(3, '0')}`;
      await connection.execute(`
        INSERT IGNORE INTO appointments (
          appointment_id, patient_id, doctor_id, appointment_date, appointment_time, duration, appointment_type, visit_type, priority, status, reason_for_visit, consultation_fee
        ) VALUES (?, ?, ?, CURDATE(), ?, 30, 'consultation', 'first-visit', 'medium', 'scheduled', 'Auto-seeded appointment', 300.00)
      `, [aptId, patientRows[i].id, doctorRows[i % doctorRows.length].id, time]);
    }
  }
}

async function main() {
  let connection;
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    await ensureTables(connection);
    await upsertDoctorsAndStaff(connection);
    await upsertPatients(connection);
    await upsertRooms(connection);
    await upsertShifts(connection);
    await upsertAppointments(connection);
    console.log('✅ Real-time demo data seeded successfully.');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    if (connection) await connection.end();
  }
}

main();


