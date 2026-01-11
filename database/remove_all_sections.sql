-- Remove All School Sections from Database
-- This script will remove all class sections and related data
-- Date: 2025-01-11

USE `faculty_evaluation`;

-- Backup all relevant tables before deletion (optional but recommended)
CREATE TABLE IF NOT EXISTS `class_sections_backup_all` AS SELECT * FROM `class_sections`;
CREATE TABLE IF NOT EXISTS `course_offerings_backup_all` AS SELECT * FROM `course_offerings`;
CREATE TABLE IF NOT EXISTS `faculty_assignments_backup_all` AS SELECT * FROM `faculty_assignments`;
CREATE TABLE IF NOT EXISTS `student_profiles_backup_all` AS SELECT * FROM `student_profiles`;

-- Disable foreign key checks to allow deletion
SET FOREIGN_KEY_CHECKS = 0;

-- Remove evaluation submissions and answers related to sections
DELETE FROM `evaluation_answers` 
WHERE `submission_id` IN (
    SELECT `id` FROM `evaluation_submissions` 
    WHERE `faculty_assignment_id` IN (
        SELECT `id` FROM `faculty_assignments` 
        WHERE `course_offering_id` IN (
            SELECT `id` FROM `course_offerings` 
            WHERE `class_section_id` IN (
                SELECT `id` FROM `class_sections`
            )
        )
    )
);

DELETE FROM `evaluation_submissions` 
WHERE `faculty_assignment_id` IN (
    SELECT `id` FROM `faculty_assignments` 
    WHERE `course_offering_id` IN (
        SELECT `id` FROM `course_offerings` 
        WHERE `class_section_id` IN (
            SELECT `id` FROM `class_sections`
        )
    )
);

-- Remove faculty assignments related to sections
DELETE FROM `faculty_assignments` 
WHERE `course_offering_id` IN (
    SELECT `id` FROM `course_offerings` 
    WHERE `class_section_id` IN (
        SELECT `id` FROM `class_sections`
    )
);

-- Remove course offerings related to sections
DELETE FROM `course_offerings` 
WHERE `class_section_id` IN (
    SELECT `id` FROM `class_sections`
);

-- Update student profiles to remove section references
UPDATE `student_profiles` 
SET `class_section_id` = NULL 
WHERE `class_section_id` IS NOT NULL;

-- Remove all class sections
DELETE FROM `class_sections`;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify the removal
SELECT 'Class Sections Remaining:' as status;
SELECT COUNT(*) as count FROM `class_sections`;

SELECT 'Course Offerings Remaining:' as status;
SELECT COUNT(*) as count FROM `course_offerings`;

SELECT 'Faculty Assignments Remaining:' as status;
SELECT COUNT(*) as count FROM `faculty_assignments`;

SELECT 'Student Profiles with Section References:' as status;
SELECT COUNT(*) as count FROM `student_profiles` WHERE `class_section_id` IS NOT NULL;

-- Show remaining data (should be empty for sections)
SELECT * FROM `class_sections` ORDER BY `code`;
