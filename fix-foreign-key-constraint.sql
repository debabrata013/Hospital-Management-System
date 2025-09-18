-- Fix for foreign key constraint issue in discharge_summaries table
-- This drops and recreates the table with correct foreign key reference to users table

-- Drop the existing table
DROP TABLE IF EXISTS `discharge_summaries`;

-- Recreate the table with correct foreign key constraint
CREATE TABLE `discharge_summaries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `admission_id` VARCHAR(255) NOT NULL,
  `patient_id` INT NOT NULL,
  `doctor_id` INT NOT NULL,
  `admission_diagnoses` TEXT,
  `discharge_diagnoses` TEXT NOT NULL,
  `consults` TEXT,
  `procedures` TEXT,
  `hospital_course` TEXT NOT NULL,
  `discharge_to` VARCHAR(255) NOT NULL,
  `discharge_condition` VARCHAR(255) NOT NULL,
  `discharge_medications` TEXT NOT NULL,
  `discharge_instructions` TEXT NOT NULL,
  `pending_labs` TEXT,
  `follow_up` TEXT NOT NULL,
  `copy_to` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_by` INT,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`),
  FOREIGN KEY (`doctor_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
