-- Add Grade 7, 8, 9, 10 Sections to Database
-- This script will add junior high school sections
-- Date: 2025-01-11

USE `faculty_evaluation`;

-- Insert Grade 7 sections
INSERT INTO `class_sections` (`code`, `program`, `year_level`, `adviser_name`) VALUES
('GRADE7-A', 'Grade 7', 7, 'Ms. Maria Santos'),
('GRADE7-B', 'Grade 7', 7, 'Mr. Jose Reyes'),
('GRADE7-C', 'Grade 7', 7, 'Mrs. Ana Cruz');

-- Insert Grade 8 sections
INSERT INTO `class_sections` (`code`, `program`, `year_level`, `adviser_name`) VALUES
('GRADE8-A', 'Grade 8', 8, 'Mr. Carlos Mendoza'),
('GRADE8-B', 'Grade 8', 8, 'Ms. Patricia Garcia'),
('GRADE8-C', 'Grade 8', 8, 'Mrs. Liza Rodriguez');

-- Insert Grade 9 sections
INSERT INTO `class_sections` (`code`, `program`, `year_level`, `adviser_name`) VALUES
('GRADE9-A', 'Grade 9', 9, 'Mr. Roberto Fernandez'),
('GRADE9-B', 'Grade 9', 9, 'Ms. Cristina Villanueva'),
('GRADE9-C', 'Grade 9', 9, 'Mrs. Sofia Martinez');

-- Insert Grade 10 sections
INSERT INTO `class_sections` (`code`, `program`, `year_level`, `adviser_name`) VALUES
('GRADE10-A', 'Grade 10', 10, 'Mr. Antonio Lopez'),
('GRADE10-B', 'Grade 10', 10, 'Ms. Jennifer Castillo'),
('GRADE10-C', 'Grade 10', 10, 'Mrs. Rosario Santiago');

-- Verify the added sections
SELECT * FROM `class_sections` 
WHERE `year_level` IN (7, 8, 9, 10)
ORDER BY `year_level`, `code`;

-- Show summary by grade level
SELECT 
    `year_level` as Grade,
    COUNT(*) as Number_of_Sections,
    GROUP_CONCAT(`code` ORDER BY `code`) as Sections
FROM `class_sections` 
WHERE `year_level` IN (7, 8, 9, 10)
GROUP BY `year_level`
ORDER BY `year_level`;
