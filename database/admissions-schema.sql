-- =====================================================
-- PATIENT ADMISSIONS MANAGEMENT SCHEMA
-- =====================================================

-- Room types table
CREATE TABLE IF NOT EXISTS room_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type_name VARCHAR(50) NOT NULL,
    base_rate DECIMAL(10,2) NOT NULL,
    description TEXT,
    amenities JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_type_name (type_name)
);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_number VARCHAR(20) UNIQUE NOT NULL,
    room_type_id INT NOT NULL,
    floor_number INT,
    capacity INT DEFAULT 1,
    status ENUM('available', 'occupied', 'maintenance', 'cleaning') DEFAULT 'available',
    amenities JSON,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (room_type_id) REFERENCES room_types(id),
    INDEX idx_room_number (room_number),
    INDEX idx_status (status),
    INDEX idx_floor (floor_number)
);

-- Admissions table
CREATE TABLE IF NOT EXISTS admissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    admission_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    room_id INT NOT NULL,
    doctor_id INT NOT NULL,
    admission_date DATETIME NOT NULL,
    discharge_date DATETIME NULL,
    admission_type ENUM('emergency', 'planned', 'transfer', 'observation') DEFAULT 'planned',
    status ENUM('active', 'discharged', 'transferred', 'cancelled') DEFAULT 'active',
    diagnosis TEXT,
    chief_complaint TEXT,
    admission_notes TEXT,
    discharge_notes TEXT,
    discharge_summary TEXT,
    discharge_instructions TEXT,
    estimated_stay_days INT,
    total_charges DECIMAL(12,2) DEFAULT 0.00,
    insurance_details JSON,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relation VARCHAR(50),
    admitted_by INT NOT NULL,
    discharged_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id),
    FOREIGN KEY (admitted_by) REFERENCES users(id),
    FOREIGN KEY (discharged_by) REFERENCES users(id),
    INDEX idx_admission_id (admission_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_room_id (room_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_status (status),
    INDEX idx_admission_date (admission_date)
);

-- Admission charges table
CREATE TABLE IF NOT EXISTS admission_charges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    admission_id INT NOT NULL,
    charge_type ENUM('room', 'nursing', 'medicine', 'procedure', 'consultation', 'lab', 'other') NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    quantity INT DEFAULT 1,
    charge_date DATE NOT NULL,
    notes TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (admission_id) REFERENCES admissions(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_admission_id (admission_id),
    INDEX idx_charge_type (charge_type),
    INDEX idx_charge_date (charge_date)
);

-- Bed assignments history table
CREATE TABLE IF NOT EXISTS bed_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    admission_id INT NOT NULL,
    room_id INT NOT NULL,
    bed_number VARCHAR(10),
    assigned_date DATETIME NOT NULL,
    released_date DATETIME NULL,
    reason VARCHAR(255),
    assigned_by INT NOT NULL,
    
    FOREIGN KEY (admission_id) REFERENCES admissions(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (assigned_by) REFERENCES users(id),
    INDEX idx_admission_id (admission_id),
    INDEX idx_room_id (room_id),
    INDEX idx_assigned_date (assigned_date)
);

-- Insert default room types
INSERT INTO room_types (type_name, base_rate, description, amenities) VALUES
('General Ward', 1500.00, 'Standard shared room with basic amenities', '["shared_bathroom", "basic_bed", "visitor_chair"]'),
('Semi-Private', 2500.00, 'Semi-private room with 2 beds', '["shared_bathroom", "tv", "visitor_chair", "storage"]'),
('Private Room', 4000.00, 'Private single occupancy room', '["private_bathroom", "tv", "ac", "visitor_sofa", "storage", "phone"]'),
('Deluxe Room', 6000.00, 'Deluxe room with premium amenities', '["private_bathroom", "tv", "ac", "refrigerator", "visitor_sofa", "storage", "phone", "wifi"]'),
('ICU', 8000.00, 'Intensive Care Unit with monitoring equipment', '["monitoring_equipment", "ventilator_ready", "24x7_nursing", "restricted_access"]'),
('NICU', 10000.00, 'Neonatal Intensive Care Unit', '["specialized_equipment", "incubator", "24x7_specialist", "restricted_access"]'),
('Emergency', 2000.00, 'Emergency observation room', '["monitoring_equipment", "emergency_supplies", "quick_access"]');

-- Insert sample rooms
INSERT INTO rooms (room_number, room_type_id, floor_number, capacity, status) VALUES
-- Ground Floor - Emergency
('E001', 7, 0, 1, 'available'),
('E002', 7, 0, 1, 'available'),
('E003', 7, 0, 1, 'available'),

-- First Floor - General Ward
('G101', 1, 1, 4, 'available'),
('G102', 1, 1, 4, 'available'),
('G103', 1, 1, 4, 'available'),
('G104', 1, 1, 4, 'available'),

-- Second Floor - Semi-Private & Private
('S201', 2, 2, 2, 'available'),
('S202', 2, 2, 2, 'available'),
('P203', 3, 2, 1, 'available'),
('P204', 3, 2, 1, 'available'),
('P205', 3, 2, 1, 'available'),

-- Third Floor - Deluxe & ICU
('D301', 4, 3, 1, 'available'),
('D302', 4, 3, 1, 'available'),
('I303', 5, 3, 1, 'available'),
('I304', 5, 3, 1, 'available'),
('N305', 6, 3, 1, 'available');
