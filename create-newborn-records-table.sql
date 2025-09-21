-- Create newborn_records table for Hospital Management System
-- Run this SQL script in your MySQL database

CREATE TABLE IF NOT EXISTS newborn_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    record_id VARCHAR(20) NOT NULL UNIQUE,
    birth_date DATETIME NOT NULL,
    gender ENUM('male', 'female', 'ambiguous') NOT NULL,
    status ENUM('healthy', 'under_observation', 'critical', 'deceased') NOT NULL,
    weight_grams INT NOT NULL,
    mother_name VARCHAR(100),
    doctor_id INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_birth_date (birth_date),
    INDEX idx_gender (gender),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for testing
INSERT INTO newborn_records
(record_id, birth_date, gender, status, weight_grams, mother_name, doctor_id, notes)
VALUES
('NB001', '2024-01-15 10:30:00', 'male', 'healthy', 3200, 'Sarah Johnson', 1, 'Normal delivery, healthy baby boy'),
('NB002', '2024-01-16 14:20:00', 'female', 'under_observation', 2800, 'Priya Sharma', 1, 'Baby under observation for jaundice')
ON DUPLICATE KEY UPDATE
  notes = VALUES(notes);
