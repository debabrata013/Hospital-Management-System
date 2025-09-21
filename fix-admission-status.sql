-- Fix admission status for patients who have discharge summaries but are still marked as active

-- Fix existing discharge summaries that were created but admission status wasn't updated
UPDATE admissions a
JOIN discharge_summaries ds ON a.admission_id COLLATE utf8mb4_unicode_ci = ds.admission_id COLLATE utf8mb4_unicode_ci
SET 
    a.status = 'discharged',
    a.discharge_date = ds.created_at,
    a.discharged_by = ds.doctor_id
WHERE a.status = 'active' AND ds.id IS NOT NULL;
