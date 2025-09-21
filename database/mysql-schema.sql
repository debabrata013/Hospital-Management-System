-- =====================================================
-- आरोग्य अस्पताल (Arogya Hospital) Management System
-- MySQL Database Schema for Hostinger Migration
-- =====================================================

-- Drop existing database if exists and create new one
DROP DATABASE IF EXISTS u153229971_Hospital;
CREATE DATABASE u153229971_Hospital CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE u153229971_Hospital;

-- =====================================================
-- 1. USERS & AUTHENTICATION TABLES
-- =====================================================

-- Users table (Staff, Doctors, Admins)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('super-admin', 'admin', 'doctor', 'staff', 'receptionist', 'pharmacy') NOT NULL,
    contact_number VARCHAR(15) NOT NULL,
    address TEXT,
    date_of_birth DATE,
    gender ENUM('Male', 'Female', 'Other'),
    employee_id VARCHAR(20) UNIQUE,
    department VARCHAR(50),
    specialization VARCHAR(100),
    qualification VARCHAR(255),
    experience_years INT DEFAULT 0,
    license_number VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    profile_image VARCHAR(255),
    emergency_contact VARCHAR(15),
    emergency_contact_name VARCHAR(100),
    joining_date DATE,
    salary DECIMAL(10,2),
    shift_preference ENUM('morning', 'evening', 'night', 'flexible') DEFAULT 'flexible',
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_employee_id (employee_id),
    INDEX idx_department (department),
    INDEX idx_active (is_active)
);

-- User permissions table
CREATE TABLE user_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    module VARCHAR(50) NOT NULL,
    permissions JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_module (user_id, module)
);

-- =====================================================
-- 2. PATIENT MANAGEMENT TABLES
-- =====================================================

-- Patients table
CREATE TABLE patients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown') DEFAULT 'Unknown',
    contact_number VARCHAR(15) NOT NULL,
    email VARCHAR(255),
    address TEXT NOT NULL,
    city VARCHAR(50),
    state VARCHAR(50),
    pincode VARCHAR(10),
    marital_status ENUM('Single', 'Married', 'Divorced', 'Widowed', 'Other') DEFAULT 'Single',
    occupation VARCHAR(100),
    emergency_contact_name VARCHAR(100) NOT NULL,
    emergency_contact_number VARCHAR(15) NOT NULL,
    emergency_contact_relation VARCHAR(50),
    insurance_provider VARCHAR(100),
    insurance_policy_number VARCHAR(50),
    insurance_expiry_date DATE,
    aadhar_number VARCHAR(12),
    profile_image VARCHAR(255),
    medical_history TEXT,
    allergies TEXT,
    current_medications TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    registration_date DATE DEFAULT (CURRENT_DATE),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_name (name),
    INDEX idx_contact (contact_number),
    INDEX idx_registration_date (registration_date),
    INDEX idx_blood_group (blood_group)
);

-- Patient vitals table
CREATE TABLE patient_vitals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    recorded_by INT NOT NULL,
    height DECIMAL(5,2), -- in cm
    weight DECIMAL(5,2), -- in kg
    bmi DECIMAL(4,2),
    blood_pressure_systolic INT,
    blood_pressure_diastolic INT,
    heart_rate INT,
    temperature DECIMAL(4,2), -- in Celsius
    respiratory_rate INT,
    oxygen_saturation INT,
    blood_sugar_level DECIMAL(5,2),
    notes TEXT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id),
    INDEX idx_patient_date (patient_id, recorded_at),
    INDEX idx_recorded_by (recorded_by)
);

-- =====================================================
-- 3. APPOINTMENT MANAGEMENT TABLES
-- =====================================================

-- Appointments table
CREATE TABLE appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration INT DEFAULT 30, -- in minutes
    appointment_type ENUM('consultation', 'follow-up', 'emergency', 'routine-checkup', 'procedure', 'vaccination', 'counseling') DEFAULT 'consultation',
    visit_type ENUM('first-visit', 'follow-up', 'routine', 'emergency') DEFAULT 'first-visit',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show', 'rescheduled') DEFAULT 'scheduled',
    reason_for_visit TEXT,
    symptoms TEXT,
    chief_complaint TEXT,
    consultation_fee DECIMAL(8,2) DEFAULT 0.00,
    room_number VARCHAR(10),
    notes TEXT,
    cancellation_reason TEXT,
    rescheduled_from INT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id),
    FOREIGN KEY (rescheduled_from) REFERENCES appointments(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_appointment_id (appointment_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_status (status),
    INDEX idx_appointment_datetime (appointment_date, appointment_time)
);

-- Appointment queue table
CREATE TABLE appointment_queue (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT NOT NULL,
    queue_number INT NOT NULL,
    estimated_time TIME,
    actual_start_time TIMESTAMP NULL,
    actual_end_time TIMESTAMP NULL,
    status ENUM('waiting', 'in-progress', 'completed', 'skipped') DEFAULT 'waiting',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    INDEX idx_queue_number (queue_number),
    INDEX idx_status (status)
);

-- =====================================================
-- 4. MEDICAL RECORDS TABLES
-- =====================================================

-- Medical records table
CREATE TABLE medical_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    record_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    appointment_id INT,
    doctor_id INT NOT NULL,
    visit_date DATE NOT NULL,
    chief_complaint TEXT,
    history_of_present_illness TEXT,
    past_medical_history TEXT,
    family_history TEXT,
    social_history TEXT,
    physical_examination TEXT,
    diagnosis TEXT,
    differential_diagnosis TEXT,
    treatment_plan TEXT,
    follow_up_instructions TEXT,
    doctor_notes TEXT,
    ai_summary TEXT,
    is_confidential BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id),
    INDEX idx_record_id (record_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_visit_date (visit_date)
);

-- =====================================================
-- 5. PRESCRIPTION MANAGEMENT TABLES
-- =====================================================

-- Prescriptions table
CREATE TABLE prescriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    prescription_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_id INT,
    medical_record_id INT,
    prescription_date DATE NOT NULL,
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('active', 'completed', 'cancelled', 'expired') DEFAULT 'active',
    notes TEXT,
    follow_up_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    FOREIGN KEY (medical_record_id) REFERENCES medical_records(id),
    INDEX idx_prescription_id (prescription_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_prescription_date (prescription_date),
    INDEX idx_status (status)
);

-- Prescription medications table
CREATE TABLE prescription_medications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    prescription_id INT NOT NULL,
    medicine_id INT NOT NULL,
    medicine_name VARCHAR(100) NOT NULL,
    dosage VARCHAR(50) NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(8,2) DEFAULT 0.00,
    total_price DECIMAL(8,2) DEFAULT 0.00,
    instructions TEXT,
    is_dispensed BOOLEAN DEFAULT FALSE,
    dispensed_at TIMESTAMP NULL,
    dispensed_by INT NULL,
    
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id),
    FOREIGN KEY (dispensed_by) REFERENCES users(id),
    INDEX idx_prescription_id (prescription_id),
    INDEX idx_medicine_id (medicine_id)
);
