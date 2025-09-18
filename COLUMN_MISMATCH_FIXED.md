# 🔧 **URGENT FIX: Column Mismatch Error**

## ❌ **Problem Identified:**
Your database table was created with different column names than the API expects:

**Database Table Has:**
- `department` (instead of `ward_assignment`)
- `status` values: `'Scheduled'`, `'Completed'`, `'Cancelled'` (capital case)
- Missing: `max_patients`, `current_patients` columns

**API Was Expecting:**
- `ward_assignment` column  
- `status` values: `'scheduled'`, `'active'`, `'completed'`, `'cancelled'` (lowercase)
- `max_patients`, `current_patients` columns

## ✅ **SOLUTION APPLIED:**

I've updated the API code to match your actual database structure:

### 1. **API Changes Made:**
- Changed `ward_assignment` → `department` in SQL queries
- Changed `'scheduled'` → `'Scheduled'` in status values
- Changed `'cancelled'` → `'Cancelled'` in status checks
- Removed references to missing `max_patients`, `current_patients` columns
- Added default values in SELECT queries

### 2. **Files Updated:**
- ✅ `app/api/admin/nurses-schedules/route.ts` - Main API endpoint
- ✅ `app/api/admin/nurses-schedules/[id]/route.ts` - Individual schedule operations

## 🚀 **Your System Should Now Work!**

Try creating a nurse schedule again. The "Create Schedule" button should now work properly.

## 📋 **Alternative: Update Database Structure**

If you prefer to make the database match the API instead, run this SQL:

```sql
-- Add missing columns to match API expectations
ALTER TABLE nurse_schedules ADD COLUMN ward_assignment VARCHAR(100);
ALTER TABLE nurse_schedules ADD COLUMN max_patients INT DEFAULT 8;
ALTER TABLE nurse_schedules ADD COLUMN current_patients INT DEFAULT 0;

-- Copy data from department to ward_assignment
UPDATE nurse_schedules SET ward_assignment = department;

-- Update status values to lowercase
UPDATE nurse_schedules SET status = 'scheduled' WHERE status = 'Scheduled';
UPDATE nurse_schedules SET status = 'completed' WHERE status = 'Completed';
UPDATE nurse_schedules SET status = 'cancelled' WHERE status = 'Cancelled';

-- Change status column to use lowercase values
ALTER TABLE nurse_schedules MODIFY COLUMN status ENUM('scheduled', 'active', 'completed', 'cancelled') DEFAULT 'scheduled';

-- Drop old department column (optional)
-- ALTER TABLE nurse_schedules DROP COLUMN department;
```

## 🎯 **Test Now:**
1. Go to Admin Dashboard → Nurses Schedules
2. Click "Create Schedule"  
3. Fill in the form and submit
4. It should work without the column error!

**The API now matches your actual database structure.** ✅