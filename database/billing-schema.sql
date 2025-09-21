-- =====================================================
-- BILLING & PAYMENT MANAGEMENT SCHEMA
-- =====================================================

-- Bills table - Main billing records
CREATE TABLE IF NOT EXISTS bills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bill_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    appointment_id INT NULL,
    bill_type ENUM('consultation', 'pharmacy', 'lab', 'procedure', 'admission', 'emergency', 'other') DEFAULT 'consultation',
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    final_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    payment_status ENUM('pending', 'partial', 'paid', 'cancelled', 'refunded') DEFAULT 'pending',
    payment_method ENUM('cash', 'card', 'upi', 'razorpay', 'insurance', 'other') NULL,
    razorpay_order_id VARCHAR(100) NULL,
    razorpay_payment_id VARCHAR(100) NULL,
    is_offline BOOLEAN DEFAULT TRUE,
    notes TEXT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_bill_id (bill_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_created_at (created_at)
);

-- Bill items table - Individual services/items in a bill
CREATE TABLE IF NOT EXISTS bill_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bill_id INT NOT NULL,
    item_type ENUM('consultation', 'medicine', 'test', 'procedure', 'room_charge', 'other') NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    item_description TEXT NULL,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
    INDEX idx_bill_id (bill_id),
    INDEX idx_item_type (item_type)
);

-- Payments table - Track all payment transactions
CREATE TABLE IF NOT EXISTS payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payment_id VARCHAR(20) UNIQUE NOT NULL,
    bill_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'card', 'upi', 'razorpay', 'insurance', 'other') NOT NULL,
    payment_status ENUM('pending', 'success', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
    razorpay_order_id VARCHAR(100) NULL,
    razorpay_payment_id VARCHAR(100) NULL,
    razorpay_signature VARCHAR(255) NULL,
    transaction_reference VARCHAR(100) NULL,
    payment_date TIMESTAMP NULL,
    notes TEXT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_payment_id (payment_id),
    INDEX idx_bill_id (bill_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_payment_date (payment_date)
);

-- Bill templates table - Predefined service pricing
CREATE TABLE IF NOT EXISTS bill_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    template_name VARCHAR(100) NOT NULL,
    item_type ENUM('consultation', 'medicine', 'test', 'procedure', 'room_charge', 'other') NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    default_price DECIMAL(10,2) NOT NULL,
    description TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_template_name (template_name),
    INDEX idx_item_type (item_type),
    INDEX idx_is_active (is_active)
);

-- Insert default bill templates
INSERT INTO bill_templates (template_name, item_type, item_name, default_price, description) VALUES
('General Consultation', 'consultation', 'General Consultation', 500.00, 'General doctor consultation fee'),
('Specialist Consultation', 'consultation', 'Specialist Consultation', 800.00, 'Specialist doctor consultation fee'),
('Emergency Consultation', 'consultation', 'Emergency Consultation', 1000.00, 'Emergency consultation fee'),
('Blood Test', 'test', 'Complete Blood Count (CBC)', 300.00, 'Complete blood count test'),
('X-Ray Chest', 'test', 'X-Ray Chest', 400.00, 'Chest X-ray examination'),
('ECG', 'test', 'Electrocardiogram', 200.00, 'Heart rhythm test'),
('Room Charge - General', 'room_charge', 'General Ward (Per Day)', 1500.00, 'General ward room charge per day'),
('Room Charge - Private', 'room_charge', 'Private Room (Per Day)', 3000.00, 'Private room charge per day'),
('Dressing', 'procedure', 'Wound Dressing', 150.00, 'Wound cleaning and dressing'),
('Injection', 'procedure', 'Injection Administration', 50.00, 'Medicine injection service');
