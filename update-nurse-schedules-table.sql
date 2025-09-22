ALTER TABLE `nurse_schedules`
ADD COLUMN `start_date` DATE NULL DEFAULT NULL AFTER `shift_date`,
ADD COLUMN `end_date` DATE NULL DEFAULT NULL AFTER `start_date`;

-- Make shift_date nullable as it won't be used for recurring schedules
ALTER TABLE `nurse_schedules` MODIFY `shift_date` DATE NULL;
