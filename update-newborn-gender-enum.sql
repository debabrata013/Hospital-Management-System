-- Update newborn_records table to change gender ENUM from 'other' to 'ambiguous'
-- Run this SQL script in your MySQL database

-- First, update any existing 'other' values to 'ambiguous'
UPDATE newborn_records 
SET gender = 'ambiguous' 
WHERE gender = 'other';

-- Then modify the ENUM to replace 'other' with 'ambiguous'
ALTER TABLE newborn_records 
MODIFY COLUMN gender ENUM('male', 'female', 'ambiguous') NOT NULL;

-- Verify the change
DESCRIBE newborn_records;
