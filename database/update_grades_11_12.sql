-- Backup current class sections (optional)
CREATE TABLE IF NOT EXISTS `class_sections_backup` AS SELECT * FROM `class_sections`;

-- Update Year 1 to Grade 11
UPDATE `class_sections` 
SET `program` = REPLACE(`program`, 'Year 1', 'Grade 11'),
    `year_level` = 11
WHERE `program` LIKE '%Year 1%';

-- Update Year 2 to Grade 12
UPDATE `class_sections` 
SET `program` = REPLACE(`program`, 'Year 2', 'Grade 12'),
    `year_level` = 12
WHERE `program` LIKE '%Year 2%';

-- Verify the changes
SELECT * FROM `class_sections` 
WHERE `program` LIKE '%Grade 11%' 
   OR `program` LIKE '%Grade 12%'
   OR `program` LIKE '%Year 1%'
   OR `program` LIKE '%Year 2%'
ORDER BY `program`, `code`;
