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
-- =====================================================
-- 6. MEDICINE & INVENTORY MANAGEMENT TABLES
-- =====================================================

-- Medicines table
CREATE TABLE medicines (
    id INT PRIMARY KEY AUTO_INCREMENT,
    medicine_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    generic_name VARCHAR(100),
    brand_name VARCHAR(100),
    category VARCHAR(50),
    manufacturer VARCHAR(100),
    composition TEXT,
    strength VARCHAR(50),
    dosage_form ENUM('tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'inhaler', 'other') NOT NULL,
    pack_size VARCHAR(20),
    unit_price DECIMAL(8,2) NOT NULL,
    mrp DECIMAL(8,2) NOT NULL,
    current_stock INT DEFAULT 0,
    minimum_stock INT DEFAULT 10,
    maximum_stock INT DEFAULT 1000,
    expiry_date DATE,
    batch_number VARCHAR(50),
    supplier VARCHAR(100),
    storage_conditions TEXT,
    side_effects TEXT,
    contraindications TEXT,
    drug_interactions TEXT,
    pregnancy_category ENUM('A', 'B', 'C', 'D', 'X', 'Unknown') DEFAULT 'Unknown',
    prescription_required BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_medicine_id (medicine_id),
    INDEX idx_name (name),
    INDEX idx_generic_name (generic_name),
    INDEX idx_category (category),
    INDEX idx_current_stock (current_stock),
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_active (is_active)
);

-- Medicine stock transactions table
CREATE TABLE medicine_stock_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    medicine_id INT NOT NULL,
    transaction_type ENUM('purchase', 'sale', 'return', 'adjustment', 'expired') NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(8,2),
    total_amount DECIMAL(10,2),
    batch_number VARCHAR(50),
    expiry_date DATE,
    supplier VARCHAR(100),
    reference_id VARCHAR(50), -- Purchase order ID, prescription ID, etc.
    notes TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_medicine_id (medicine_id),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- 7. BILLING & PAYMENT TABLES
-- =====================================================

-- Billing table
CREATE TABLE billing (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bill_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    appointment_id INT,
    bill_date DATE NOT NULL,
    bill_type ENUM('consultation', 'procedure', 'pharmacy', 'lab', 'admission', 'other') NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    tax_percentage DECIMAL(5,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    balance_amount DECIMAL(10,2) DEFAULT 0.00,
    payment_status ENUM('pending', 'partial', 'paid', 'refunded', 'cancelled') DEFAULT 'pending',
    payment_method ENUM('cash', 'card', 'upi', 'bank_transfer', 'insurance', 'other'),
    insurance_claim_amount DECIMAL(10,2) DEFAULT 0.00,
    notes TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_bill_id (bill_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_bill_date (bill_date),
    INDEX idx_payment_status (payment_status),
    INDEX idx_bill_type (bill_type)
);

-- Billing items table
CREATE TABLE billing_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    billing_id INT NOT NULL,
    item_type ENUM('consultation', 'procedure', 'medicine', 'test', 'room_charge', 'other') NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    item_code VARCHAR(20),
    quantity INT DEFAULT 1,
    unit_price DECIMAL(8,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    discount_amount DECIMAL(8,2) DEFAULT 0.00,
    final_amount DECIMAL(10,2) NOT NULL,
    
    FOREIGN KEY (billing_id) REFERENCES billing(id) ON DELETE CASCADE,
    INDEX idx_billing_id (billing_id),
    INDEX idx_item_type (item_type)
);

-- Payment transactions table
CREATE TABLE payment_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_id VARCHAR(20) UNIQUE NOT NULL,
    billing_id INT NOT NULL,
    payment_date DATE NOT NULL,
    payment_method ENUM('cash', 'card', 'upi', 'bank_transfer', 'insurance', 'other') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    reference_number VARCHAR(50),
    bank_name VARCHAR(100),
    card_last_four VARCHAR(4),
    upi_id VARCHAR(100),
    status ENUM('pending', 'success', 'failed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    processed_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (billing_id) REFERENCES billing(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_billing_id (billing_id),
    INDEX idx_payment_date (payment_date),
    INDEX idx_status (status)
);

-- =====================================================
-- 8. STAFF MANAGEMENT TABLES
-- =====================================================

-- Staff profiles table (extends users table)
CREATE TABLE staff_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    employee_type ENUM('full-time', 'part-time', 'contract', 'intern') DEFAULT 'full-time',
    reporting_manager_id INT,
    work_location VARCHAR(100),
    shift_timings JSON, -- Store shift preferences as JSON
    skills TEXT,
    certifications TEXT,
    languages_known VARCHAR(255),
    bank_account_number VARCHAR(20),
    bank_name VARCHAR(100),
    ifsc_code VARCHAR(11),
    pan_number VARCHAR(10),
    aadhar_number VARCHAR(12),
    pf_number VARCHAR(20),
    esi_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reporting_manager_id) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_employee_type (employee_type)
);

-- Staff shifts table
CREATE TABLE staff_shifts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    shift_id VARCHAR(20) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    shift_date DATE NOT NULL,
    shift_type ENUM('morning', 'evening', 'night', 'full-day') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_duration INT DEFAULT 60, -- in minutes
    status ENUM('scheduled', 'started', 'break', 'completed', 'absent', 'cancelled') DEFAULT 'scheduled',
    check_in_time TIMESTAMP NULL,
    check_out_time TIMESTAMP NULL,
    total_hours DECIMAL(4,2),
    overtime_hours DECIMAL(4,2) DEFAULT 0.00,
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_shift_id (shift_id),
    INDEX idx_user_id (user_id),
    INDEX idx_shift_date (shift_date),
    INDEX idx_status (status)
);

-- Leave requests table
CREATE TABLE leave_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id VARCHAR(20) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    leave_type ENUM('sick', 'casual', 'earned', 'maternity', 'paternity', 'emergency', 'other') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    approved_by INT,
    approved_at TIMESTAMP NULL,
    rejection_reason TEXT,
    emergency_contact VARCHAR(15),
    supporting_documents VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id),
    INDEX idx_request_id (request_id),
    INDEX idx_user_id (user_id),
    INDEX idx_leave_type (leave_type),
    INDEX idx_status (status),
    INDEX idx_start_date (start_date)
);

-- =====================================================
-- 9. TEST REPORTS & LAB MANAGEMENT TABLES
-- =====================================================

-- Test reports table
CREATE TABLE test_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_id INT,
    test_name VARCHAR(100) NOT NULL,
    test_category VARCHAR(50),
    test_date DATE NOT NULL,
    sample_collection_date DATE,
    report_date DATE,
    test_results JSON, -- Store test results as JSON
    normal_ranges JSON, -- Store normal ranges as JSON
    interpretation TEXT,
    technician_notes TEXT,
    doctor_comments TEXT,
    status ENUM('ordered', 'sample_collected', 'in_progress', 'completed', 'cancelled') DEFAULT 'ordered',
    urgency ENUM('routine', 'urgent', 'stat') DEFAULT 'routine',
    cost DECIMAL(8,2) DEFAULT 0.00,
    lab_name VARCHAR(100),
    technician_name VARCHAR(100),
    report_file_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    INDEX idx_report_id (report_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_test_date (test_date),
    INDEX idx_status (status)
);

-- =====================================================
-- 10. DISCHARGE & AFTERCARE TABLES
-- =====================================================

-- Discharge summaries table
CREATE TABLE discharge_summaries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    summary_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    admission_date DATE NOT NULL,
    discharge_date DATE NOT NULL,
    length_of_stay INT NOT NULL,
    admission_diagnosis TEXT,
    final_diagnosis TEXT,
    procedures_performed TEXT,
    treatment_given TEXT,
    condition_on_discharge ENUM('improved', 'stable', 'critical', 'deceased') NOT NULL,
    discharge_instructions TEXT,
    follow_up_date DATE,
    follow_up_doctor_id INT,
    medications_on_discharge TEXT,
    diet_instructions TEXT,
    activity_restrictions TEXT,
    warning_signs TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id),
    FOREIGN KEY (follow_up_doctor_id) REFERENCES users(id),
    INDEX idx_summary_id (summary_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_discharge_date (discharge_date)
);

-- Aftercare instructions table
CREATE TABLE aftercare_instructions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    instruction_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    discharge_summary_id INT,
    instruction_type ENUM('medication', 'diet', 'exercise', 'wound_care', 'follow_up', 'lifestyle', 'other') NOT NULL,
    instruction_title VARCHAR(100) NOT NULL,
    instruction_details TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    start_date DATE,
    end_date DATE,
    frequency VARCHAR(50),
    is_completed BOOLEAN DEFAULT FALSE,
    completion_date DATE,
    patient_feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id),
    FOREIGN KEY (discharge_summary_id) REFERENCES discharge_summaries(id),
    INDEX idx_instruction_id (instruction_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_instruction_type (instruction_type)
);
-- =====================================================
-- 11. MESSAGING & COMMUNICATION TABLES
-- =====================================================

-- Messages table
CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    message_id VARCHAR(20) UNIQUE NOT NULL,
    sender_id INT NOT NULL,
    recipient_id INT,
    recipient_type ENUM('user', 'department', 'broadcast') DEFAULT 'user',
    department VARCHAR(50),
    subject VARCHAR(200),
    message_body TEXT NOT NULL,
    message_type ENUM('info', 'urgent', 'emergency', 'reminder', 'announcement') DEFAULT 'info',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    is_archived BOOLEAN DEFAULT FALSE,
    archived_at TIMESTAMP NULL,
    parent_message_id INT, -- For replies
    attachments JSON, -- Store file paths as JSON array
    scheduled_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_message_id) REFERENCES messages(id),
    INDEX idx_message_id (message_id),
    INDEX idx_sender_id (sender_id),
    INDEX idx_recipient_id (recipient_id),
    INDEX idx_message_type (message_type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- Message recipients table (for group messages)
CREATE TABLE message_recipients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    message_id INT NOT NULL,
    recipient_id INT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_message_recipient (message_id, recipient_id)
);

-- =====================================================
-- 12. AUDIT & LOGGING TABLES
-- =====================================================

-- Audit logs table
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    log_id VARCHAR(20) UNIQUE NOT NULL,
    user_id INT,
    action ENUM('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'PRINT', 'SHARE') NOT NULL,
    resource_type VARCHAR(50) NOT NULL, -- Table name or resource type
    resource_id VARCHAR(50), -- ID of the affected resource
    old_values JSON, -- Previous values (for updates)
    new_values JSON, -- New values (for creates/updates)
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(100),
    additional_info JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_log_id (log_id),
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_resource_type (resource_type),
    INDEX idx_created_at (created_at)
);

-- System notifications table
CREATE TABLE system_notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    notification_id VARCHAR(20) UNIQUE NOT NULL,
    user_id INT,
    notification_type ENUM('appointment_reminder', 'medicine_expiry', 'low_stock', 'payment_due', 'system_alert', 'birthday', 'other') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    action_url VARCHAR(255),
    action_label VARCHAR(50),
    expires_at TIMESTAMP NULL,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notification_id (notification_id),
    INDEX idx_user_id (user_id),
    INDEX idx_notification_type (notification_type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- 13. VENDOR & PURCHASE MANAGEMENT TABLES
-- =====================================================

-- Vendors table
CREATE TABLE vendors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vendor_id VARCHAR(20) UNIQUE NOT NULL,
    vendor_name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(15) NOT NULL,
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    pincode VARCHAR(10),
    gst_number VARCHAR(15),
    pan_number VARCHAR(10),
    vendor_type ENUM('medicine', 'equipment', 'supplies', 'services', 'other') NOT NULL,
    payment_terms VARCHAR(100),
    credit_limit DECIMAL(12,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    rating DECIMAL(2,1) DEFAULT 0.0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_vendor_name (vendor_name),
    INDEX idx_vendor_type (vendor_type),
    INDEX idx_is_active (is_active)
);

-- Purchase orders table
CREATE TABLE purchase_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    po_id VARCHAR(20) UNIQUE NOT NULL,
    vendor_id INT NOT NULL,
    po_date DATE NOT NULL,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    total_amount DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    final_amount DECIMAL(12,2) NOT NULL,
    status ENUM('draft', 'sent', 'confirmed', 'partially_received', 'completed', 'cancelled') DEFAULT 'draft',
    payment_status ENUM('pending', 'partial', 'paid') DEFAULT 'pending',
    payment_terms VARCHAR(100),
    delivery_address TEXT,
    special_instructions TEXT,
    created_by INT NOT NULL,
    approved_by INT,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    INDEX idx_po_id (po_id),
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_po_date (po_date),
    INDEX idx_status (status)
);

-- Purchase order items table
CREATE TABLE purchase_order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    po_id INT NOT NULL,
    medicine_id INT,
    item_name VARCHAR(100) NOT NULL,
    item_description TEXT,
    quantity_ordered INT NOT NULL,
    quantity_received INT DEFAULT 0,
    unit_price DECIMAL(8,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    batch_number VARCHAR(50),
    expiry_date DATE,
    received_date DATE,
    
    FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id),
    INDEX idx_po_id (po_id),
    INDEX idx_medicine_id (medicine_id)
);

-- =====================================================
-- 14. HOSPITAL CONFIGURATION TABLES
-- =====================================================

-- Hospital settings table
CREATE TABLE hospital_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    category VARCHAR(50) DEFAULT 'general',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (updated_by) REFERENCES users(id),
    INDEX idx_setting_key (setting_key),
    INDEX idx_category (category)
);

-- Departments table
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    department_id VARCHAR(20) UNIQUE NOT NULL,
    department_name VARCHAR(100) NOT NULL,
    description TEXT,
    head_of_department_id INT,
    location VARCHAR(100),
    contact_number VARCHAR(15),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (head_of_department_id) REFERENCES users(id),
    INDEX idx_department_id (department_id),
    INDEX idx_department_name (department_name),
    INDEX idx_is_active (is_active)
);

-- Rooms table
CREATE TABLE rooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_number VARCHAR(10) UNIQUE NOT NULL,
    room_type ENUM('consultation', 'procedure', 'ward', 'icu', 'operation_theater', 'emergency', 'other') NOT NULL,
    department_id INT,
    floor_number INT,
    capacity INT DEFAULT 1,
    current_occupancy INT DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    equipment JSON, -- Store equipment list as JSON
    amenities JSON, -- Store amenities as JSON
    daily_rate DECIMAL(8,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (department_id) REFERENCES departments(id),
    INDEX idx_room_number (room_number),
    INDEX idx_room_type (room_type),
    INDEX idx_is_available (is_available)
);

-- =====================================================
-- 15. FILE MANAGEMENT TABLE
-- =====================================================

-- File uploads table
CREATE TABLE file_uploads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    file_id VARCHAR(20) UNIQUE NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    related_to_type VARCHAR(50), -- patient, appointment, prescription, etc.
    related_to_id INT,
    uploaded_by INT NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    access_permissions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    INDEX idx_file_id (file_id),
    INDEX idx_related_to (related_to_type, related_to_id),
    INDEX idx_uploaded_by (uploaded_by)
);

-- =====================================================
-- 16. INITIAL DATA INSERTS
-- =====================================================

-- Insert default hospital settings
INSERT INTO hospital_settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
('hospital_name', 'आरोग्य अस्पताल (Arogya Hospital)', 'string', 'general', 'Hospital Name', TRUE),
('hospital_address', 'Main Street, City, State - 123456', 'string', 'general', 'Hospital Address', TRUE),
('hospital_phone', '+91-1234567890', 'string', 'general', 'Hospital Contact Number', TRUE),
('hospital_email', 'info@arogyahospital.com', 'string', 'general', 'Hospital Email', TRUE),
('consultation_fee', '500.00', 'number', 'billing', 'Default Consultation Fee', FALSE),
('appointment_duration', '30', 'number', 'appointments', 'Default Appointment Duration (minutes)', FALSE),
('working_hours_start', '09:00', 'string', 'general', 'Hospital Working Hours Start', TRUE),
('working_hours_end', '18:00', 'string', 'general', 'Hospital Working Hours End', TRUE),
('emergency_contact', '+91-9876543210', 'string', 'general', 'Emergency Contact Number', TRUE),
('timezone', 'Asia/Kolkata', 'string', 'general', 'Hospital Timezone', FALSE);

-- Insert default departments
INSERT INTO departments (department_id, department_name, description, is_active) VALUES
('DEPT001', 'General Medicine', 'General medical consultations and treatments', TRUE),
('DEPT002', 'Cardiology', 'Heart and cardiovascular treatments', TRUE),
('DEPT003', 'Orthopedics', 'Bone and joint treatments', TRUE),
('DEPT004', 'Pediatrics', 'Child healthcare and treatments', TRUE),
('DEPT005', 'Gynecology', 'Women healthcare and treatments', TRUE),
('DEPT006', 'Emergency', 'Emergency medical services', TRUE),
('DEPT007', 'Pharmacy', 'Medicine dispensing and management', TRUE),
('DEPT008', 'Laboratory', 'Diagnostic tests and reports', TRUE);

-- Insert default rooms
INSERT INTO rooms (room_number, room_type, department_id, floor_number, capacity, is_available) VALUES
('C001', 'consultation', 1, 1, 1, TRUE),
('C002', 'consultation', 1, 1, 1, TRUE),
('C003', 'consultation', 2, 1, 1, TRUE),
('C004', 'consultation', 3, 1, 1, TRUE),
('E001', 'emergency', 6, 0, 2, TRUE),
('E002', 'emergency', 6, 0, 2, TRUE),
('W001', 'ward', 1, 2, 4, TRUE),
('W002', 'ward', 1, 2, 4, TRUE);

-- Create indexes for better performance
CREATE INDEX idx_patients_name_phone ON patients(name, contact_number);
CREATE INDEX idx_appointments_date_doctor ON appointments(appointment_date, doctor_id);
CREATE INDEX idx_prescriptions_patient_date ON prescriptions(patient_id, prescription_date);
CREATE INDEX idx_billing_patient_date ON billing(patient_id, bill_date);
CREATE INDEX idx_medicines_name_stock ON medicines(name, current_stock);
CREATE INDEX idx_users_role_active ON users(role, is_active);

-- =====================================================
-- END OF SCHEMA
-- =====================================================
