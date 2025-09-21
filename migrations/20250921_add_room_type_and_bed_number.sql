-- Migration: Add room_type and bed_number support for general wards
-- Safe to run multiple times (idempotent-style checks)

-- 1) Admissions: add columns if not exist
ALTER TABLE admissions
  ADD COLUMN IF NOT EXISTS room_type VARCHAR(50) NULL AFTER room_id,
  ADD COLUMN IF NOT EXISTS bed_number VARCHAR(50) NULL AFTER manual_room_number;

-- 2) Rooms: ensure room_type column exists (string values like 'Private', 'General Ward')
ALTER TABLE rooms
  ADD COLUMN IF NOT EXISTS room_type VARCHAR(50) NULL;

-- 3) Bed assignments: ensure bed_number exists and add uniqueness for ward beds
ALTER TABLE bed_assignments
  ADD COLUMN IF NOT EXISTS bed_number VARCHAR(50) NULL;

-- Unique bed enforcement (only one active assignment per room+bed)
-- Note: MySQL before 8.0 doesn't support functional indexes like (released_date IS NULL).
-- We enforce uniqueness at time of insert in API; additionally create a general unique index on (room_id, bed_number, assigned_date) to reduce accidental duplicates.
CREATE INDEX IF NOT EXISTS idx_bed_assignments_room_bed ON bed_assignments(room_id, bed_number);
