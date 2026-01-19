-- Complete Database Setup for Faculty Evaluation System
-- Fresh Installation Script for phpMyAdmin
-- Date: 2025-01-14

-- ====================================================================
-- PART 1: CREATE DATABASE AND TABLES
-- ====================================================================

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS `faculty_evaluation`;
USE `faculty_evaluation`;

-- Create users table
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('student', 'faculty', 'admin') NOT NULL,
    `status` ENUM('active', 'inactive') DEFAULT 'active',
    `email_verified` TINYINT(1) DEFAULT 0,
    `last_login_at` DATETIME NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create departments table
CREATE TABLE IF NOT EXISTS `departments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create class_sections table
CREATE TABLE IF NOT EXISTS `class_sections` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(50) UNIQUE NOT NULL,
    `program` VARCHAR(255) NOT NULL,
    `year_level` INT NOT NULL,
    `adviser_name` VARCHAR(255),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create student_profiles table
CREATE TABLE IF NOT EXISTS `student_profiles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `student_number` VARCHAR(50) UNIQUE NOT NULL,
    `year_level` INT NOT NULL,
    `class_section_id` INT,
    `course_program` VARCHAR(255),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`class_section_id`) REFERENCES `class_sections`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create user_settings table (per-user preferences)
CREATE TABLE IF NOT EXISTS `user_settings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `receive_email_reminders` TINYINT(1) DEFAULT 1,
    `notify_period_close` TINYINT(1) DEFAULT 1,
    `profile_visible_to_faculty` TINYINT(1) DEFAULT 1,
    `submit_anonymously` TINYINT(1) DEFAULT 1,
    `theme_preference` VARCHAR(20) DEFAULT 'light',
    `language_preference` VARCHAR(10) DEFAULT 'en',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create faculty_profiles table
CREATE TABLE IF NOT EXISTS `faculty_profiles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `department_id` INT,
    `employee_id` VARCHAR(50) UNIQUE NOT NULL,
    `specialization` VARCHAR(255),
    `subjects_taught` TEXT,
    `grade_levels` VARCHAR(255),
    `course_program_teaching` VARCHAR(255),
    `sections` VARCHAR(255),
    `mobile_number` VARCHAR(20),
    `alternate_email` VARCHAR(255),
    `role` VARCHAR(100),
    `status` VARCHAR(50) DEFAULT 'Active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create faculty_assignments table
CREATE TABLE IF NOT EXISTS `faculty_assignments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `faculty_user_id` INT NOT NULL,
    `class_section_id` INT NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`faculty_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`class_section_id`) REFERENCES `class_sections`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ====================================================================
-- PART 2: INSERT DEPARTMENTS
-- ====================================================================

INSERT INTO `departments` (`name`) VALUES 
('Science'),
('Mathematics'),
('English'),
('Filipino'),
('Social Studies'),
('Arts'),
('Physical Education'),
('Technology');

-- ====================================================================
-- PART 3: ADD JUNIOR HIGH SCHOOL SECTIONS (Grades 7-10)
-- ====================================================================

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

-- ====================================================================
-- PART 4: ADD SENIOR HIGH SCHOOL SECTIONS (Grades 11-12)
-- ====================================================================

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

-- ====================================================================
-- PART 5: INSERT SAMPLE FACULTY DATA
-- ====================================================================

-- Insert faculty user account
-- IMPORTANT: Change this password hash in production!
INSERT INTO `users` (`full_name`, `email`, `password_hash`, `role`, `email_verified`, `created_at`)
VALUES
('Denise Alia', 'denisealia@dihs.edu.ph', '$2y$10$placeholder_hash_change_me', 'faculty', 1, NOW());

-- Insert faculty profile data
INSERT INTO `faculty_profiles` (
    `user_id`,
    `department_id`,
    `employee_id`,
    `specialization`,
    `subjects_taught`,
    `grade_levels`,
    `course_program_teaching`,
    `sections`,
    `mobile_number`,
    `alternate_email`,
    `role`,
    `status`,
    `created_at`
) VALUES (
    (SELECT `id` FROM `users` WHERE `email` = 'denisealia@dihs.edu.ph' LIMIT 1),
    (SELECT `id` FROM `departments` WHERE `name` = 'Science' LIMIT 1),
    'EMP-2024-001',
    'English',
    'Biology',
    'Grade 11',
    'STEM Program',
    'A',
    '9919912366',
    'daas@gmail.com',
    'Teacher',
    'Active',
    NOW()
);

-- ====================================================================
-- PART 6: CREATE ADMIN ACCOUNT (Optional)
-- ====================================================================

-- Insert admin user
-- IMPORTANT: Change this password hash in production!
INSERT INTO `users` (`full_name`, `email`, `password_hash`, `role`, `email_verified`, `created_at`)
VALUES
('System Admin', 'admin@dihs.edu.ph', '$2y$10$placeholder_hash_change_me', 'admin', 1, NOW());

-- ====================================================================
-- VERIFICATION QUERIES (Run these separately after import)
-- ====================================================================

-- To verify the database setup, run these queries one by one in phpMyAdmin:

-- 1. Verify all class sections
-- SELECT * FROM `class_sections` ORDER BY `year_level`, `code`;

-- 2. Summary by grade level
-- SELECT 
--     `year_level` as Grade,
--     COUNT(*) as Number_of_Sections,
--     GROUP_CONCAT(`code` ORDER BY `code`) as Sections
-- FROM `class_sections` 
-- GROUP BY `year_level`
-- ORDER BY `year_level`;

-- 3. Verify departments
-- SELECT * FROM `departments`;

-- 4. Verify faculty data
-- SELECT 
--     u.id,
--     u.full_name,
--     u.email,
--     u.role,
--     fp.employee_id,
--     d.name as department,
--     fp.specialization,
--     fp.subjects_taught,
--     fp.grade_levels,
--     fp.sections,
--     fp.status
-- FROM `users` u
-- LEFT JOIN `faculty_profiles` fp ON u.id = fp.user_id
-- LEFT JOIN `departments` d ON fp.department_id = d.id
-- WHERE u.role IN ('faculty', 'admin');

-- 5. Overall summary
-- SELECT 'Total departments' as metric, COUNT(*) as value FROM `departments`
-- UNION ALL
-- SELECT 'Total class sections', COUNT(*) FROM `class_sections`
-- UNION ALL
-- SELECT 'Total users', COUNT(*) FROM `users`
-- UNION ALL
-- SELECT 'Total faculty', COUNT(*) FROM `users` WHERE `role` = 'faculty'
-- UNION ALL
-- SELECT 'Total admin', COUNT(*) FROM `users` WHERE `role` = 'admin';

-- ====================================================================
-- DATABASE SETUP COMPLETED
-- ====================================================================
-- The database is now ready for use!
-- Remember to update password hashes before going to production.