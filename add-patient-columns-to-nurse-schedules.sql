ALTER TABLE `nurse_schedules`
ADD COLUMN `max_patients` INT(11) NULL DEFAULT 8 AFTER `shift_type`,
ADD COLUMN `current_patients` INT(11) NULL DEFAULT 0 AFTER `max_patients`;
