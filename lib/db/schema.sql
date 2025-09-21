-- Pharmacy Database Schema

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Medicines table
CREATE TABLE IF NOT EXISTS medicines (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    category VARCHAR(100),
    manufacturer VARCHAR(255),
    unit_price DECIMAL(10,2),
    current_stock INT DEFAULT 0,
    minimum_stock INT DEFAULT 10,
    maximum_stock INT DEFAULT 1000,
    unit VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Medicine batches table
CREATE TABLE IF NOT EXISTS medicine_batches (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    medicine_id VARCHAR(36),
    batch_number VARCHAR(100) NOT NULL,
    expiry_date DATE,
    quantity INT,
    purchase_price DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    vendor_id VARCHAR(36),
    received_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL
);

-- Prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    prescription_number VARCHAR(100) UNIQUE,
    patient_id VARCHAR(36),
    patient_name VARCHAR(255),
    doctor_id VARCHAR(36),
    doctor_name VARCHAR(255),
    status ENUM('pending', 'dispensed', 'partially_dispensed', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Prescription items table
CREATE TABLE IF NOT EXISTS prescription_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    prescription_id VARCHAR(36),
    medicine_id VARCHAR(36),
    medicine_name VARCHAR(255),
    quantity INT,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    instructions TEXT,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    dispensed_quantity INT DEFAULT 0,
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE SET NULL
);

-- Stock transactions table
CREATE TABLE IF NOT EXISTS stock_transactions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    medicine_id VARCHAR(36),
    batch_id VARCHAR(36),
    transaction_type ENUM('purchase', 'sale', 'adjustment', 'return'),
    quantity INT,
    unit_price DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    reference_id VARCHAR(36),
    reference_type VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES medicine_batches(id) ON DELETE SET NULL
);

-- Purchase orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_number VARCHAR(100) UNIQUE,
    vendor_id VARCHAR(36),
    status ENUM('pending', 'approved', 'received', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(10,2),
    order_date DATE,
    expected_delivery DATE,
    received_date DATE,
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL
);

-- Insert sample data
INSERT INTO vendors (name, contact_person, phone, email, address, status) VALUES
('MediSupply Co.', 'राज कुमार', '9876543210', 'raj@medisupply.com', 'नई दिल्ली', 'active'),
('PharmaCorp Ltd.', 'सुनीता शर्मा', '9876543211', 'sunita@pharmacorp.com', 'मुंबई', 'active'),
('HealthCare Distributors', 'अमित गुप्ता', '9876543212', 'amit@healthcare.com', 'पुणे', 'active');

INSERT INTO medicines (name, generic_name, category, manufacturer, unit_price, current_stock, minimum_stock, unit) VALUES
('Paracetamol 500mg', 'Paracetamol', 'Pain Relief', 'ABC Pharma', 2.50, 150, 50, 'tablet'),
('Amoxicillin 250mg', 'Amoxicillin', 'Antibiotic', 'XYZ Pharma', 5.00, 80, 30, 'capsule'),
('Insulin Injection', 'Human Insulin', 'Diabetes', 'MediCorp', 120.00, 25, 10, 'vial'),
('Aspirin 75mg', 'Acetylsalicylic Acid', 'Cardiac', 'CardioMed', 1.50, 200, 100, 'tablet'),
('Omeprazole 20mg', 'Omeprazole', 'Gastric', 'GastroPharm', 8.00, 60, 25, 'capsule');

INSERT INTO medicine_batches (medicine_id, batch_number, expiry_date, quantity, purchase_price, selling_price, received_date) 
SELECT id, CONCAT('BATCH', FLOOR(RAND() * 1000)), DATE_ADD(CURDATE(), INTERVAL FLOOR(RAND() * 365) + 30 DAY), 
       FLOOR(current_stock/2), unit_price * 0.8, unit_price, CURDATE() 
FROM medicines;
