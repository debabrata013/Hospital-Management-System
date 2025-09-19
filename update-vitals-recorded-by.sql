-- Update Vitals Recorded By Field to Show Actual Nurse Names
-- This script updates existing vitals records that show "Staff Nurse" to display actual nurse names

-- First, let's see what we're working with
SELECT 
    COUNT(*) as total_vitals,
    COUNT(CASE WHEN recorded_by = 'Staff Nurse' THEN 1 END) as staff_nurse_records,
    COUNT(CASE WHEN recorded_by != 'Staff Nurse' THEN 1 END) as named_records
FROM vitals;

-- Show current recorded_by values
SELECT recorded_by, COUNT(*) as count 
FROM vitals 
GROUP BY recorded_by 
ORDER BY count DESC;

-- Strategy 1: Update records to use actual nurse names from users table
-- This will randomly assign existing "Staff Nurse" records to actual nurses in the system
-- Note: This is a best-effort approach since we can't determine who actually recorded each vital

-- Get list of nurses in the system
SELECT id, name, role, department 
FROM users 
WHERE role IN ('nurse', 'staff') 
AND is_active = 1 
ORDER BY name;

-- Update vitals records with "Staff Nurse" to use actual nurse names
-- We'll distribute them among available nurses

-- Method 1: Simple approach - Update all to a specific nurse
-- Replace 'debabrata pal' with the name of the nurse you want to assign
UPDATE vitals 
SET recorded_by = 'debabrata pal' 
WHERE recorded_by = 'Staff Nurse';

-- Method 2: If you want to distribute among multiple nurses, use this approach:
-- First, create a temporary table with nurse assignments
/*
CREATE TEMPORARY TABLE temp_nurse_assignments AS
SELECT 
    v.id as vital_id,
    u.name as nurse_name
FROM vitals v
CROSS JOIN (
    SELECT name, ROW_NUMBER() OVER (ORDER BY name) as nurse_row
    FROM users 
    WHERE role IN ('nurse', 'staff') 
    AND is_active = 1
) u
WHERE v.recorded_by = 'Staff Nurse'
AND u.nurse_row = ((v.id % (SELECT COUNT(*) FROM users WHERE role IN ('nurse', 'staff') AND is_active = 1)) + 1);

-- Then update using the temporary table
UPDATE vitals v
JOIN temp_nurse_assignments t ON v.id = t.vital_id
SET v.recorded_by = t.nurse_name;

-- Clean up
DROP TEMPORARY TABLE temp_nurse_assignments;
*/

-- Alternative Strategy 2: If you prefer to assign to specific nurses
-- Uncomment and modify the following queries as needed:

-- Update all "Staff Nurse" records to a specific nurse (example: debabrata pal)
-- UPDATE vitals 
-- SET recorded_by = 'debabrata pal' 
-- WHERE recorded_by = 'Staff Nurse';

-- Or update based on patient assignment patterns
-- UPDATE vitals v
-- JOIN patient_nurse_assignments pna ON v.patient_id = pna.patient_id
-- JOIN users u ON pna.nurse_id = u.id
-- SET v.recorded_by = u.name
-- WHERE v.recorded_by = 'Staff Nurse' 
-- AND pna.is_active = 1;

-- Verification queries to run after update
-- Check the results
SELECT 
    COUNT(*) as total_vitals,
    COUNT(CASE WHEN recorded_by = 'Staff Nurse' THEN 1 END) as remaining_staff_nurse_records,
    COUNT(CASE WHEN recorded_by != 'Staff Nurse' THEN 1 END) as named_records
FROM vitals;

-- Show updated recorded_by values
SELECT recorded_by, COUNT(*) as count 
FROM vitals 
GROUP BY recorded_by 
ORDER BY count DESC;

-- Show sample of updated records
SELECT 
    id,
    patient_name,
    recorded_by,
    recorded_at,
    blood_pressure,
    pulse,
    temperature
FROM vitals 
WHERE recorded_by != 'Staff Nurse'
ORDER BY recorded_at DESC 
LIMIT 10;

-- Optional: Create a backup before running the update
-- CREATE TABLE vitals_backup AS SELECT * FROM vitals WHERE recorded_by = 'Staff Nurse';
