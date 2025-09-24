-- Create USG Reports table for storing NT/NB ultrasonography reports
-- This table is specifically for Gynecology department doctors
CREATE TABLE IF NOT EXISTS usg_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id VARCHAR(50) UNIQUE NOT NULL,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  report_type VARCHAR(255) NOT NULL DEFAULT 'NT AND NB ULTRASONOGRAPHY REPORT',
  report_data JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key constraints
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Indexes for better performance
  INDEX idx_patient_id (patient_id),
  INDEX idx_doctor_id (doctor_id),
  INDEX idx_report_id (report_id),
  INDEX idx_created_at (created_at)
);

-- Note: This table stores NT/NB ultrasonography reports for gynecology department
-- The report_data JSON field contains all the form data including:
-- - Patient information (name, age, gender, etc.)
-- - LMP, GA by LMP, EDD by LMP
-- - Fetal parameters (CRL, YOLK SAC, FHR, etc.)
-- - Nuchal translucency, nasal bone measurements
-- - Placenta and cervical length details
-- - Impression, EDD by scan, suggestions
-- - Doctor notes and declarations
