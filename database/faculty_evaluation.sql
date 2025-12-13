-- Faculty Evaluation Database Schema
-- Import this file via phpMyAdmin (Import tab) to create the database structure and seed data.
-- Date: 2025-12-06

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `faculty_evaluation`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE `faculty_evaluation`;

-- Drop existing tables when re-importing to avoid conflicts
DROP TABLE IF EXISTS `evaluation_answers`;
DROP TABLE IF EXISTS `evaluation_submissions`;
DROP TABLE IF EXISTS `evaluation_questions`;
DROP TABLE IF EXISTS `evaluation_forms`;
DROP TABLE IF EXISTS `evaluation_periods`;
DROP TABLE IF EXISTS `faculty_assignments`;
DROP TABLE IF EXISTS `course_offerings`;
DROP TABLE IF EXISTS `class_sections`;
DROP TABLE IF EXISTS `courses`;
DROP TABLE IF EXISTS `departments`;
DROP TABLE IF EXISTS `user_settings`;
DROP TABLE IF EXISTS `student_profiles`;
DROP TABLE IF EXISTS `faculty_profiles`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------------
-- Core user and profile tables
-- ---------------------------------------------------------------------------
CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `role` ENUM('student','faculty','admin') NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `status` ENUM('active','inactive','pending') NOT NULL DEFAULT 'pending',
  `last_login_at` DATETIME NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `student_profiles` (
  `user_id` INT UNSIGNED NOT NULL,
  `student_number` VARCHAR(30) NOT NULL,
  `class_section_id` INT UNSIGNED NULL,
  `course_program` VARCHAR(120) NULL,
  `year_level` TINYINT UNSIGNED NULL,
  `contact_number` VARCHAR(30) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_student_number` (`student_number`),
  CONSTRAINT `fk_student_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `faculty_profiles` (
  `user_id` INT UNSIGNED NOT NULL,
  `employee_number` VARCHAR(30) NOT NULL,
  `department_id` INT UNSIGNED NULL,
  `academic_rank` VARCHAR(100) NULL,
  `office_email` VARCHAR(191) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_faculty_employee_number` (`employee_number`),
  CONSTRAINT `fk_faculty_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_settings` (
  `user_id` INT UNSIGNED NOT NULL,
  `receive_email_reminders` TINYINT(1) NOT NULL DEFAULT 1,
  `notify_period_close` TINYINT(1) NOT NULL DEFAULT 1,
  `profile_visible_to_faculty` TINYINT(1) NOT NULL DEFAULT 1,
  `submit_anonymously` TINYINT(1) NOT NULL DEFAULT 1,
  `theme_preference` ENUM('light','dark','auto') NOT NULL DEFAULT 'light',
  `language_preference` VARCHAR(10) NOT NULL DEFAULT 'en',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_user_settings_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Academic structure
-- ---------------------------------------------------------------------------
CREATE TABLE `departments` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(20) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `description` TEXT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_departments_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `courses` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `department_id` INT UNSIGNED NOT NULL,
  `code` VARCHAR(20) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_courses_code` (`code`),
  KEY `idx_courses_department` (`department_id`),
  CONSTRAINT `fk_courses_department` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `class_sections` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(40) NOT NULL,
  `program` VARCHAR(120) NOT NULL,
  `year_level` TINYINT UNSIGNED NULL,
  `adviser_name` VARCHAR(150) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_class_sections_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `course_offerings` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `course_id` INT UNSIGNED NOT NULL,
  `class_section_id` INT UNSIGNED NOT NULL,
  `academic_year` VARCHAR(15) NOT NULL,
  `term` ENUM('1st','2nd','Summer') NOT NULL DEFAULT '1st',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_course_offering` (`course_id`,`class_section_id`,`academic_year`,`term`),
  KEY `idx_course_offerings_class_section` (`class_section_id`),
  CONSTRAINT `fk_course_offerings_course` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_course_offerings_section` FOREIGN KEY (`class_section_id`) REFERENCES `class_sections`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `faculty_assignments` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `faculty_user_id` INT UNSIGNED NOT NULL,
  `course_offering_id` INT UNSIGNED NOT NULL,
  `assigned_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_faculty_assignment` (`faculty_user_id`,`course_offering_id`),
  KEY `idx_faculty_assignments_offering` (`course_offering_id`),
  CONSTRAINT `fk_faculty_assignments_faculty` FOREIGN KEY (`faculty_user_id`) REFERENCES `faculty_profiles`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_faculty_assignments_offering` FOREIGN KEY (`course_offering_id`) REFERENCES `course_offerings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Evaluation structure
-- ---------------------------------------------------------------------------
CREATE TABLE `evaluation_periods` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `academic_year` VARCHAR(15) NOT NULL,
  `term` ENUM('1st','2nd','Summer') NOT NULL DEFAULT '1st',
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `status` ENUM('draft','open','closed','archived') NOT NULL DEFAULT 'draft',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `evaluation_forms` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `period_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_evaluation_forms_period` (`period_id`),
  CONSTRAINT `fk_evaluation_forms_period` FOREIGN KEY (`period_id`) REFERENCES `evaluation_periods`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `evaluation_questions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `form_id` INT UNSIGNED NOT NULL,
  `question_order` SMALLINT UNSIGNED NOT NULL,
  `question_text` VARCHAR(255) NOT NULL,
  `question_type` ENUM('likert','text') NOT NULL DEFAULT 'likert',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_question_order` (`form_id`,`question_order`),
  KEY `idx_evaluation_questions_form` (`form_id`),
  CONSTRAINT `fk_evaluation_questions_form` FOREIGN KEY (`form_id`) REFERENCES `evaluation_forms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `evaluation_submissions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `form_id` INT UNSIGNED NOT NULL,
  `student_user_id` INT UNSIGNED NOT NULL,
  `faculty_assignment_id` INT UNSIGNED NOT NULL,
  `status` ENUM('draft','submitted','reviewed') NOT NULL DEFAULT 'submitted',
  `submitted_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `strengths_comment` TEXT NULL,
  `improvement_comment` TEXT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_submission_unique` (`form_id`,`student_user_id`,`faculty_assignment_id`),
  KEY `idx_submission_student` (`student_user_id`),
  KEY `idx_submission_assignment` (`faculty_assignment_id`),
  CONSTRAINT `fk_submissions_form` FOREIGN KEY (`form_id`) REFERENCES `evaluation_forms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_submissions_student` FOREIGN KEY (`student_user_id`) REFERENCES `student_profiles`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_submissions_assignment` FOREIGN KEY (`faculty_assignment_id`) REFERENCES `faculty_assignments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `evaluation_answers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `submission_id` BIGINT UNSIGNED NOT NULL,
  `question_id` INT UNSIGNED NOT NULL,
  `likert_value` TINYINT UNSIGNED NULL,
  `text_response` TEXT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_submission_question` (`submission_id`,`question_id`),
  KEY `idx_answers_question` (`question_id`),
  CONSTRAINT `fk_answers_submission` FOREIGN KEY (`submission_id`) REFERENCES `evaluation_submissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_answers_question` FOREIGN KEY (`question_id`) REFERENCES `evaluation_questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Seed Data
-- ---------------------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO `users` (`role`,`email`,`password_hash`,`full_name`,`status`,`last_login_at`) VALUES
  ('admin','admin@dihs.edu.ph','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa8LM60qh4tp1e1Yu1Qq0w4u/bi','System Administrator','active',NULL),
  ('student','john.doe@student.edu','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa8LM60qh4tp1e1Yu1Qq0w4u/bi','John Doe','active','2025-12-01 08:15:00'),
  ('faculty','denise.sernande@dihs.edu.ph','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa8LM60qh4tp1e1Yu1Qq0w4u/bi','Dr. Denise Alia Sernande','active','2025-12-02 10:05:00'),
  ('faculty','jane.johnson@dihs.edu.ph','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa8LM60qh4tp1e1Yu1Qq0w4u/bi','Prof. Jane Johnson','active',NULL),
  ('faculty','julia.fornal@dihs.edu.ph','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa8LM60qh4tp1e1Yu1Qq0w4u/bi','Dr. Julia Chloe Fornal','active',NULL),
  ('faculty','felix.carter@dihs.edu.ph','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa8LM60qh4tp1e1Yu1Qq0w4u/bi','Dr. Felix Carter','active',NULL);

INSERT INTO `departments` (`code`,`name`,`description`) VALUES
  ('CHEM','Chemistry Department','Focuses on foundational and advanced chemistry coursework.'),
  ('SOFTENG','Software Engineering Department','Responsible for application development and engineering subjects.'),
  ('DATSCI','Data Science Department','Handles analytics, data science, and AI curriculum.'),
  ('COMM','Communications Department','Oversees language and communication courses.');

INSERT INTO `courses` (`department_id`,`code`,`name`,`description`) VALUES
  (1,'CHEM101','Chemistry','Introductory and intermediate chemistry for science majors.'),
  (2,'APPDEV301','Application Development','Advanced application development with modern frameworks.'),
  (3,'DSFUND201','Data Science Fundamentals','Core principles of data science and machine learning.'),
  (4,'TECHWRIT205','Technical Writing','Professional and academic technical writing.');

INSERT INTO `class_sections` (`code`,`program`,`year_level`,`adviser_name`) VALUES
  ('BSCS-3A','BS Computer Science',3,'Prof. Daniel Brown'),
  ('BSCS-3B','BS Computer Science',3,'Prof. Laura Smith'),
  ('BSIT-2A','BS Information Technology',2,'Prof. Brian Adams'),
  ('BSIT-2B','BS Information Technology',2,'Prof. Clara Reyes');

INSERT INTO `student_profiles` (`user_id`,`student_number`,`class_section_id`,`course_program`,`year_level`,`contact_number`) VALUES
  (2,'2021-12345',1,'BS Computer Science',3,'09171234567');

INSERT INTO `faculty_profiles` (`user_id`,`employee_number`,`department_id`,`academic_rank`,`office_email`) VALUES
  (3,'FAC-001',1,'Associate Professor','denise.sernande@dihs.edu.ph'),
  (4,'FAC-002',1,'Assistant Professor','jane.johnson@dihs.edu.ph'),
  (5,'FAC-003',2,'Professor','julia.fornal@dihs.edu.ph'),
  (6,'FAC-004',3,'Associate Professor','felix.carter@dihs.edu.ph');

INSERT INTO `user_settings` (`user_id`,`receive_email_reminders`,`notify_period_close`,`profile_visible_to_faculty`,`submit_anonymously`,`theme_preference`,`language_preference`) VALUES
  (2,1,1,1,1,'light','en'),
  (3,1,1,1,0,'dark','en'),
  (5,1,1,1,0,'auto','en');

INSERT INTO `course_offerings` (`course_id`,`class_section_id`,`academic_year`,`term`,`is_active`) VALUES
  (1,1,'2025-2026','1st',1),
  (1,2,'2025-2026','1st',1),
  (1,4,'2025-2026','1st',1),
  (2,1,'2025-2026','1st',1),
  (2,4,'2025-2026','1st',1),
  (3,1,'2025-2026','1st',1),
  (4,1,'2025-2026','2nd',1);

INSERT INTO `faculty_assignments` (`faculty_user_id`,`course_offering_id`) VALUES
  (3,1), -- Dr. Sernande teaches Chemistry to BSCS-3A
  (3,2), -- Chemistry to BSCS-3B
  (4,3), -- Prof. Johnson teaches Chemistry to BSIT-2B
  (5,4), -- Dr. Fornal teaches App Dev to BSCS-3A
  (4,5), -- Prof. Johnson teaches App Dev to BSIT-2B
  (6,6), -- Dr. Carter teaches Data Science to BSCS-3A
  (3,7); -- Dr. Sernande teaches Technical Writing to BSCS-3A

INSERT INTO `evaluation_periods` (`name`,`academic_year`,`term`,`start_date`,`end_date`,`status`) VALUES
  ('Midyear Faculty Evaluation','2025-2026','1st','2025-11-15','2025-12-15','open');

INSERT INTO `evaluation_forms` (`period_id`,`title`,`description`,`is_active`) VALUES
  (1,'Standard Faculty Evaluation Form','Likert-based assessment with qualitative feedback fields.',1);

INSERT INTO `evaluation_questions` (`form_id`,`question_order`,`question_text`,`question_type`) VALUES
  (1,1,'Communicates course objectives clearly.','likert'),
  (1,2,'Provides timely and constructive feedback.','likert'),
  (1,3,'Encourages student participation and engagement.','likert'),
  (1,4,'Offers support and guidance when needed.','likert');

INSERT INTO `evaluation_submissions` (`form_id`,`student_user_id`,`faculty_assignment_id`,`status`,`submitted_at`,`strengths_comment`,`improvement_comment`) VALUES
  (1,2,1,'submitted','2025-12-01 09:30:00','Explains complex chemistry topics with relatable examples.','Could share review materials earlier before exams.');

INSERT INTO `evaluation_answers` (`submission_id`,`question_id`,`likert_value`,`text_response`) VALUES
  (1,1,5,NULL),
  (1,2,4,NULL),
  (1,3,5,NULL),
  (1,4,4,NULL);

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------------
-- Notes
-- 1. Default passwords above are bcrypt hashes for the plaintext string "password". Replace
--    them in production using PHP's password_hash() before going live.
-- 2. Update academic_year, term, and evaluation_period dates as needed for future terms.
-- 3. Extend the seed data with additional students, faculty members, courses, and assignments
--    to match your institution's structure.
-- ---------------------------------------------------------------------------
