-- Backup current class sections (optional)
CREATE TABLE IF NOT EXISTS `class_sections_backup` AS SELECT * FROM `class_sections`;

-- Remove Grade 11 and 12 sections
DELETE FROM `class_sections` 
WHERE `program` LIKE '%Grade 11%' 
   OR `program` LIKE '%Grade 12%' 
   OR `program` LIKE '%Senior High%';

-- Verify the remaining sections
SELECT * FROM `class_sections` ORDER BY `program`, `code`;
