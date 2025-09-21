-- Add manual room/bed columns to admissions and bed_assignments
-- Safe to run multiple times with IF NOT EXISTS checks

-- admissions: manual_room_number, manual_bed_number
ALTER TABLE admissions
  ADD COLUMN IF NOT EXISTS manual_room_number VARCHAR(50) NULL AFTER room_id,
  ADD COLUMN IF NOT EXISTS manual_bed_number VARCHAR(50) NULL AFTER manual_room_number;

-- bed_assignments: bed_number
ALTER TABLE bed_assignments
  ADD COLUMN IF NOT EXISTS bed_number VARCHAR(50) NULL AFTER room_id;

-- Optionally create an index for manual room searches
CREATE INDEX IF NOT EXISTS idx_admissions_manual_room ON admissions (manual_room_number);
