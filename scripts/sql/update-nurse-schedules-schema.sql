-- Update nurse_schedules schema to align with backend expectations
-- Safe and idempotent for MySQL 8.0+

-- 1) Add ward_assignment if missing and backfill from department
ALTER TABLE nurse_schedules
  ADD COLUMN IF NOT EXISTS ward_assignment VARCHAR(100) NOT NULL DEFAULT 'General Ward';

-- Backfill ward_assignment from department when present and ward_assignment is NULL or empty
UPDATE nurse_schedules ns
JOIN information_schema.COLUMNS c
  ON c.TABLE_SCHEMA = DATABASE() AND c.TABLE_NAME = 'nurse_schedules' AND c.COLUMN_NAME = 'department'
SET ns.ward_assignment = COALESCE(NULLIF(ns.ward_assignment, ''), ns.department, 'General Ward')
WHERE ns.ward_assignment IS NULL OR ns.ward_assignment = '';

-- 2) Add max_patients and current_patients if missing
ALTER TABLE nurse_schedules
  ADD COLUMN IF NOT EXISTS max_patients INT DEFAULT 8,
  ADD COLUMN IF NOT EXISTS current_patients INT DEFAULT 0;

-- 3) Normalize status casing to lowercase to match enum and backend
UPDATE nurse_schedules
SET status = LOWER(status)
WHERE BINARY status <> LOWER(status);

-- 4) Ensure status enum has lowercase values and default 'scheduled'
-- Check current enum; if different, modify
SET @needs_enum_change = (
  SELECT CASE WHEN COLUMN_TYPE NOT IN (
    "enum('scheduled','active','completed','cancelled')",
    "enum('scheduled','active','completed','canceled')" -- tolerate US spelling but keep British default
  ) THEN 1 ELSE 0 END
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'nurse_schedules'
    AND COLUMN_NAME = 'status'
);

SET @sql := IF(@needs_enum_change = 1,
  'ALTER TABLE nurse_schedules MODIFY COLUMN status ENUM(\'scheduled\',\'active\',\'completed\',\'cancelled\') NOT NULL DEFAULT \'scheduled\';',
  'SELECT 1;'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 5) Ensure ward_assignment has default
ALTER TABLE nurse_schedules
  ALTER ward_assignment SET DEFAULT 'General Ward';

-- 6) Index/Constraint: allow multiple shifts per day but prevent exact duplicates
-- First, remove duplicate rows (same nurse_id, date, start_time, end_time) keeping the lowest id
CREATE TEMPORARY TABLE IF NOT EXISTS tmp_ns_dups AS
SELECT nurse_id, shift_date, start_time, end_time, MIN(id) AS keep_id, COUNT(*) AS cnt
FROM nurse_schedules
GROUP BY nurse_id, shift_date, start_time, end_time
HAVING cnt > 1;

DELETE ns FROM nurse_schedules ns
JOIN tmp_ns_dups d
  ON ns.nurse_id = d.nurse_id
 AND ns.shift_date = d.shift_date
 AND ns.start_time = d.start_time
 AND ns.end_time = d.end_time
WHERE ns.id <> d.keep_id;

DROP TEMPORARY TABLE IF EXISTS tmp_ns_dups;

-- Drop legacy constraint(s) if present
SET @has_old_idx = (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nurse_schedules' AND INDEX_NAME = 'unique_nurse_shift'
);
SET @drop_sql := IF(@has_old_idx > 0, 'ALTER TABLE nurse_schedules DROP INDEX unique_nurse_shift;', 'SELECT 1;');
PREPARE s1 FROM @drop_sql; EXECUTE s1; DEALLOCATE PREPARE s1;

-- Drop previous unique_nurse_schedule (with shift_type) if present
SET @has_prev_idx = (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nurse_schedules' AND INDEX_NAME = 'unique_nurse_schedule'
);
SET @drop_prev_sql := IF(@has_prev_idx > 0, 'ALTER TABLE nurse_schedules DROP INDEX unique_nurse_schedule;', 'SELECT 1;');
PREPARE s2a FROM @drop_prev_sql; EXECUTE s2a; DEALLOCATE PREPARE s2a;

-- Create new unique index to block duplicates regardless of shift_type
SET @has_time_idx = (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nurse_schedules' AND INDEX_NAME = 'unique_nurse_schedule_time'
);
SET @create_time_sql := IF(@has_time_idx = 0,
  'ALTER TABLE nurse_schedules ADD CONSTRAINT unique_nurse_schedule_time UNIQUE (nurse_id, shift_date, start_time, end_time);',
  'SELECT 1;'
);
PREPARE s2 FROM @create_time_sql; EXECUTE s2; DEALLOCATE PREPARE s2;

-- 7) Optional: Once everything is verified, you may drop department
-- ALTER TABLE nurse_schedules DROP COLUMN department;

-- Done.
