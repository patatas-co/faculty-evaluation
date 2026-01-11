-- Remove Program for Students in Year Levels 7-10
-- This script will set program to NULL for junior high school students
-- Date: 2025-01-11

USE `faculty_evaluation`;

-- Backup current student profiles (optional but recommended)
CREATE TABLE IF NOT EXISTS `student_profiles_backup_program` AS SELECT * FROM `student_profiles`;

-- Update student profiles to remove program for year levels 7-10
UPDATE `student_profiles` 
SET `course_program` = NULL 
WHERE `year_level` IN (7, 8, 9, 10);

-- Verify the changes
SELECT 
    sp.user_id,
    u.full_name,
    sp.student_number,
    sp.year_level,
    sp.course_program,
    cs.code as section_code,
    cs.program as section_program
FROM `student_profiles` sp
JOIN `users` u ON sp.user_id = u.id
LEFT JOIN `class_sections` cs ON sp.class_section_id = cs.id
WHERE sp.year_level IN (7, 8, 9, 10)
ORDER BY sp.year_level, u.full_name;

-- Show summary of updated students
SELECT 
    'Students with program removed (Grades 7-10):' as status,
    COUNT(*) as count
FROM `student_profiles` 
WHERE `year_level` IN (7, 8, 9, 10) 
AND `course_program` IS NULL;

-- Show remaining students with programs (should be grades 11+)
SELECT 
    'Students still with programs (Grades 11+):' as status,
    COUNT(*) as count
FROM `student_profiles` 
WHERE `course_program` IS NOT NULL;
