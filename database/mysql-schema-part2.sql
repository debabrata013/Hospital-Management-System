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
