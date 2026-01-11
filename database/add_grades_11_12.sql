-- Add Grade 11 and 12 Sections to Database
-- This script will add senior high school sections
-- Date: 2025-01-11

USE `faculty_evaluation`;

-- Insert Grade 11 sections
INSERT INTO `class_sections` (`code`, `program`, `year_level`, `adviser_name`) VALUES
('GRADE11-A', 'Grade 11', 11, 'Ms. Angela Reyes'),
('GRADE11-B', 'Grade 11', 11, 'Mr. Benjamin Santos'),
('GRADE11-C', 'Grade 11', 11, 'Mrs. Cristina Lopez');

-- Insert Grade 12 sections
INSERT INTO `class_sections` (`code`, `program`, `year_level`, `adviser_name`) VALUES
('GRADE12-A', 'Grade 12', 12, 'Mr. Daniel Martinez'),
('GRADE12-B', 'Grade 12', 12, 'Ms. Elizabeth Garcia'),
('GRADE12-C', 'Grade 12', 12, 'Mrs. Francisca Rodriguez');

-- Verify the added sections
SELECT * FROM `class_sections` 
WHERE `year_level` IN (11, 12)
ORDER BY `year_level`, `code`;

-- Show summary by grade level
SELECT 
    `year_level` as Grade,
    COUNT(*) as Number_of_Sections,
    GROUP_CONCAT(`code` ORDER BY `code`) as Sections
FROM `class_sections` 
WHERE `year_level` IN (11, 12)
GROUP BY `year_level`
ORDER BY `year_level`;
