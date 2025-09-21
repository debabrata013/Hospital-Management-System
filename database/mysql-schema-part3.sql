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
