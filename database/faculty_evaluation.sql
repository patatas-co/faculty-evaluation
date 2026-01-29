-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 29, 2026 at 01:55 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `faculty_evaluation`
--

-- --------------------------------------------------------

--
-- Table structure for table `class_sections`
--

CREATE TABLE `class_sections` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `program` varchar(255) NOT NULL,
  `year_level` int(11) NOT NULL,
  `adviser_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `class_sections`
--

INSERT INTO `class_sections` (`id`, `code`, `program`, `year_level`, `adviser_name`, `created_at`) VALUES
(1, 'GRADE7-SANTIAGO', 'Grade 7 - Santiago', 7, 'Ms. Maria Santos', '2026-01-19 11:51:48'),
(2, 'GRADE7-MOLINA', 'Grade 7 - Molina', 7, 'Mr. Jose Reyes', '2026-01-19 11:51:48'),
(3, 'GRADE7-SANPEDRO', 'Grade 7 - San Pedro', 7, 'Mrs. Ana Cruz', '2026-01-19 11:51:48'),
(4, 'GRADE8-AMETHYST', 'Grade 8 - Amethyst', 8, 'Mr. Carlos Mendoza', '2026-01-19 11:51:48'),
(5, 'GRADE8-EMERALD', 'Grade 8 - Emerald', 8, 'Ms. Patricia Garcia', '2026-01-19 11:51:48'),
(6, 'GRADE8-SAPPHIRE', 'Grade 8 - Sapphire', 8, 'Mrs. Liza Rodriguez', '2026-01-19 11:51:48'),
(7, 'GRADE9-NARRA', 'Grade 9 - Narra', 9, 'Mr. Roberto Fernandez', '2026-01-19 11:51:48'),
(8, 'GRADE9-MAHOGANY', 'Grade 9 - Mahogany', 9, 'Ms. Cristina Villanueva', '2026-01-19 11:51:48'),
(9, 'GRADE9-CEDAR', 'Grade 9 - Cedar', 9, 'Mrs. Sofia Martinez', '2026-01-19 11:51:48'),
(10, 'GRADE10-RIZAL', 'Grade 10 - Rizal', 10, 'Mr. Antonio Lopez', '2026-01-19 11:51:48'),
(11, 'GRADE10-BONIFACIO', 'Grade 10 - Bonifacio', 10, 'Ms. Jennifer Castillo', '2026-01-19 11:51:48'),
(12, 'GRADE10-MABINI', 'Grade 10 - Mabini', 10, 'Mrs. Rosario Santiago', '2026-01-19 11:51:48'),
(13, 'GRADE11-A', 'Grade 11', 11, 'Ms. Angela Reyes', '2026-01-19 11:51:48'),
(14, 'GRADE11-B', 'Grade 11', 11, 'Mr. Benjamin Santos', '2026-01-19 11:51:48'),
(15, 'GRADE11-C', 'Grade 11', 11, 'Mrs. Cristina Lopez', '2026-01-19 11:51:48'),
(16, 'GRADE12-A', 'Grade 12', 12, 'Mr. Daniel Martinez', '2026-01-19 11:51:48'),
(17, 'GRADE12-B', 'Grade 12', 12, 'Ms. Elizabeth Garcia', '2026-01-19 11:51:48'),
(18, 'GRADE12-C', 'Grade 12', 12, 'Mrs. Francisca Rodriguez', '2026-01-19 11:51:48'),
(19, 'GRADE7-ABELARDO', 'Grade 7 - Abelardo', 7, 'Mr. Ramon Torres', '2026-01-20 02:44:48'),
(20, 'GRADE7-JOVELLANA', 'Grade 7 - Jovellana', 7, 'Ms. Elena Ramos', '2026-01-20 02:44:48'),
(21, 'GRADE8-RUBY', 'Grade 8 - Ruby', 8, 'Ms. Sofia Diaz', '2026-01-20 02:44:49'),
(22, 'GRADE8-JADE', 'Grade 8 - Jade', 8, 'Mr. Miguel Santos', '2026-01-20 02:44:49'),
(23, 'GRADE9-TEAK', 'Grade 9 - Teak', 9, 'Mr. Antonio Reyes', '2026-01-20 02:44:49'),
(24, 'GRADE9-OAK', 'Grade 9 - Oak', 9, 'Ms. Carmen Lopez', '2026-01-20 02:44:49'),
(25, 'GRADE10-JACINTO', 'Grade 10 - Jacinto', 10, 'Ms. Maria Fernandez', '2026-01-20 02:44:49'),
(26, 'GRADE10-DELPILAR', 'Grade 10 - Del Pilar', 10, 'Mr. Ricardo Cruz', '2026-01-20 02:44:49');

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `name`, `code`, `description`, `created_at`, `updated_at`) VALUES
(14, 'Filipino', 'FIL-JHS', 'Filipino Language for Junior High School', '2026-01-19 15:44:17', '2026-01-19 15:49:52'),
(15, 'English', 'ENG-JHS', 'English Language for Junior High School', '2026-01-19 15:44:17', '2026-01-19 15:49:52'),
(16, 'Mathematics', 'MATH-JHS', 'Mathematics for Junior High School', '2026-01-19 15:44:17', '2026-01-19 15:49:52'),
(17, 'Science', 'SCI-JHS', 'Science for Junior High School', '2026-01-19 15:44:17', '2026-01-19 15:49:52'),
(18, 'Araling Panlipunan', 'AP-JHS', 'Araling Panlipunan - Social Studies', '2026-01-19 15:44:17', '2026-01-19 15:49:52'),
(19, 'MAPEH', 'MAPEH-JHS', 'Music, Arts, Physical Education, and Health', '2026-01-19 15:44:17', '2026-01-19 15:49:52'),
(20, 'Technology and Livelihood Education', 'TLE-JHS', 'TLE for Junior High School', '2026-01-19 15:44:17', '2026-01-19 15:49:52'),
(21, 'Values Education', 'VE-JHS', 'Values Education for Junior High School', '2026-01-19 15:44:17', '2026-01-19 15:49:52');

-- --------------------------------------------------------

--
-- Table structure for table `course_offerings`
--

CREATE TABLE `course_offerings` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `class_section_id` int(11) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `semester` varchar(50) DEFAULT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `course_offerings`
--

INSERT INTO `course_offerings` (`id`, `course_id`, `class_section_id`, `is_active`, `semester`, `academic_year`, `created_at`) VALUES
(23, 18, 1, 1, NULL, '2024-2025', '2026-01-19 15:44:18'),
(24, 15, 1, 1, NULL, '2024-2025', '2026-01-19 15:44:18'),
(25, 14, 1, 1, NULL, '2024-2025', '2026-01-19 15:44:18'),
(26, 19, 1, 1, NULL, '2024-2025', '2026-01-19 15:44:18'),
(27, 16, 1, 1, NULL, '2024-2025', '2026-01-19 15:44:18'),
(28, 17, 1, 1, NULL, '2024-2025', '2026-01-19 15:44:18'),
(29, 20, 1, 1, NULL, '2024-2025', '2026-01-19 15:44:18'),
(30, 21, 1, 1, NULL, '2024-2025', '2026-01-19 15:44:18'),
(31, 18, 2, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(32, 15, 2, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(33, 14, 2, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(34, 19, 2, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(35, 16, 2, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(36, 17, 2, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(37, 20, 2, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(38, 21, 2, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(39, 18, 3, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(40, 15, 3, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(41, 14, 3, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(42, 19, 3, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(43, 16, 3, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(44, 17, 3, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(45, 20, 3, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(46, 21, 3, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(47, 18, 19, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(48, 15, 19, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(49, 14, 19, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(50, 19, 19, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(51, 16, 19, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(52, 17, 19, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(53, 20, 19, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(54, 21, 19, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(55, 18, 20, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(56, 15, 20, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(57, 14, 20, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(58, 19, 20, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(59, 16, 20, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(60, 17, 20, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(61, 20, 20, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(62, 21, 20, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(94, 18, 4, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(95, 15, 4, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(96, 14, 4, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(97, 19, 4, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(98, 16, 4, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(99, 17, 4, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(100, 20, 4, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(101, 21, 4, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(102, 18, 5, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(103, 15, 5, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(104, 14, 5, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(105, 19, 5, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(106, 16, 5, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(107, 17, 5, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(108, 20, 5, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(109, 21, 5, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(110, 18, 6, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(111, 15, 6, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(112, 14, 6, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(113, 19, 6, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(114, 16, 6, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(115, 17, 6, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(116, 20, 6, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(117, 21, 6, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(118, 18, 21, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(119, 15, 21, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(120, 14, 21, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(121, 19, 21, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(122, 16, 21, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(123, 17, 21, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(124, 20, 21, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(125, 21, 21, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(126, 18, 22, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(127, 15, 22, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(128, 14, 22, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(129, 19, 22, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(130, 16, 22, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(131, 17, 22, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(132, 20, 22, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(133, 21, 22, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(157, 18, 7, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(158, 15, 7, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(159, 14, 7, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(160, 19, 7, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(161, 16, 7, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(162, 17, 7, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(163, 20, 7, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(164, 21, 7, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(165, 18, 8, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(166, 15, 8, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(167, 14, 8, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(168, 19, 8, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(169, 16, 8, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(170, 17, 8, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(171, 20, 8, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(172, 21, 8, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(173, 18, 9, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(174, 15, 9, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(175, 14, 9, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(176, 19, 9, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(177, 16, 9, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(178, 17, 9, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(179, 20, 9, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(180, 21, 9, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(181, 18, 23, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(182, 15, 23, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(183, 14, 23, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(184, 19, 23, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(185, 16, 23, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(186, 17, 23, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(187, 20, 23, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(188, 21, 23, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(189, 18, 24, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(190, 15, 24, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(191, 14, 24, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(192, 19, 24, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(193, 16, 24, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(194, 17, 24, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(195, 20, 24, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(196, 21, 24, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(220, 18, 10, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(221, 15, 10, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(222, 14, 10, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(223, 19, 10, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(224, 16, 10, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(225, 17, 10, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(226, 20, 10, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(227, 21, 10, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(228, 18, 11, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(229, 15, 11, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(230, 14, 11, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(231, 19, 11, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(232, 16, 11, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(233, 17, 11, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(234, 20, 11, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(235, 21, 11, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(236, 18, 12, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(237, 15, 12, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(238, 14, 12, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(239, 19, 12, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(240, 16, 12, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(241, 17, 12, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(242, 20, 12, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(243, 21, 12, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(244, 18, 25, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(245, 15, 25, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(246, 14, 25, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(247, 19, 25, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(248, 16, 25, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(249, 17, 25, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(250, 20, 25, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(251, 21, 25, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(252, 18, 26, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(253, 15, 26, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(254, 14, 26, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(255, 19, 26, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(256, 16, 26, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(257, 17, 26, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(258, 20, 26, 1, NULL, '2024-2025', '2026-01-20 02:45:03'),
(259, 21, 26, 1, NULL, '2024-2025', '2026-01-20 02:45:03');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`, `created_at`) VALUES
(1, 'Science', '2026-01-19 11:51:48'),
(2, 'Mathematics', '2026-01-19 11:51:48'),
(3, 'English', '2026-01-19 11:51:48'),
(4, 'Filipino', '2026-01-19 11:51:48'),
(5, 'Social Studies', '2026-01-19 11:51:48'),
(6, 'Arts', '2026-01-19 11:51:48'),
(7, 'Physical Education', '2026-01-19 11:51:48'),
(8, 'Technology', '2026-01-19 11:51:48');

-- --------------------------------------------------------

--
-- Table structure for table `faculty_assignments`
--

CREATE TABLE `faculty_assignments` (
  `id` int(11) NOT NULL,
  `faculty_user_id` int(11) NOT NULL,
  `course_offering_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `faculty_assignments`
--

INSERT INTO `faculty_assignments` (`id`, `faculty_user_id`, `course_offering_id`, `created_at`) VALUES
(23, 1, 23, '2026-01-19 15:44:18'),
(24, 1, 24, '2026-01-19 15:44:18'),
(25, 1, 25, '2026-01-19 15:44:18'),
(26, 1, 26, '2026-01-19 15:44:18'),
(27, 1, 27, '2026-01-19 15:44:18'),
(28, 1, 28, '2026-01-19 15:44:18'),
(29, 1, 29, '2026-01-19 15:44:18'),
(30, 1, 30, '2026-01-19 15:44:18'),
(31, 1, 31, '2026-01-20 02:45:03'),
(32, 1, 32, '2026-01-20 02:45:03'),
(33, 1, 33, '2026-01-20 02:45:03'),
(34, 1, 34, '2026-01-20 02:45:03'),
(35, 1, 35, '2026-01-20 02:45:03'),
(36, 1, 36, '2026-01-20 02:45:03'),
(37, 1, 37, '2026-01-20 02:45:03'),
(38, 1, 38, '2026-01-20 02:45:03'),
(39, 1, 39, '2026-01-20 02:45:03'),
(40, 1, 40, '2026-01-20 02:45:03'),
(41, 1, 41, '2026-01-20 02:45:03'),
(42, 1, 42, '2026-01-20 02:45:03'),
(43, 1, 43, '2026-01-20 02:45:03'),
(44, 1, 44, '2026-01-20 02:45:03'),
(45, 1, 45, '2026-01-20 02:45:03'),
(46, 1, 46, '2026-01-20 02:45:03'),
(47, 1, 94, '2026-01-20 02:45:03'),
(48, 1, 95, '2026-01-20 02:45:03'),
(49, 1, 96, '2026-01-20 02:45:03'),
(50, 1, 97, '2026-01-20 02:45:03'),
(51, 1, 98, '2026-01-20 02:45:03'),
(52, 1, 99, '2026-01-20 02:45:03'),
(53, 1, 100, '2026-01-20 02:45:03'),
(54, 1, 101, '2026-01-20 02:45:03'),
(55, 1, 102, '2026-01-20 02:45:03'),
(56, 1, 103, '2026-01-20 02:45:03'),
(57, 1, 104, '2026-01-20 02:45:03'),
(58, 1, 105, '2026-01-20 02:45:03'),
(59, 1, 106, '2026-01-20 02:45:03'),
(60, 1, 107, '2026-01-20 02:45:03'),
(61, 1, 108, '2026-01-20 02:45:03'),
(62, 1, 109, '2026-01-20 02:45:03'),
(63, 1, 110, '2026-01-20 02:45:03'),
(64, 1, 111, '2026-01-20 02:45:03'),
(65, 1, 112, '2026-01-20 02:45:03'),
(66, 1, 113, '2026-01-20 02:45:03'),
(67, 1, 114, '2026-01-20 02:45:03'),
(68, 1, 115, '2026-01-20 02:45:03'),
(69, 1, 116, '2026-01-20 02:45:03'),
(70, 1, 117, '2026-01-20 02:45:03'),
(71, 1, 157, '2026-01-20 02:45:03'),
(72, 1, 158, '2026-01-20 02:45:03'),
(73, 1, 159, '2026-01-20 02:45:03'),
(74, 1, 160, '2026-01-20 02:45:03'),
(75, 1, 161, '2026-01-20 02:45:03'),
(76, 1, 162, '2026-01-20 02:45:03'),
(77, 1, 163, '2026-01-20 02:45:03'),
(78, 1, 164, '2026-01-20 02:45:03'),
(79, 1, 165, '2026-01-20 02:45:03'),
(80, 1, 166, '2026-01-20 02:45:03'),
(81, 1, 167, '2026-01-20 02:45:03'),
(82, 1, 168, '2026-01-20 02:45:03'),
(83, 1, 169, '2026-01-20 02:45:03'),
(84, 1, 170, '2026-01-20 02:45:03'),
(85, 1, 171, '2026-01-20 02:45:03'),
(86, 1, 172, '2026-01-20 02:45:03'),
(87, 1, 173, '2026-01-20 02:45:03'),
(88, 1, 174, '2026-01-20 02:45:03'),
(89, 1, 175, '2026-01-20 02:45:03'),
(90, 1, 176, '2026-01-20 02:45:03'),
(91, 1, 177, '2026-01-20 02:45:03'),
(92, 1, 178, '2026-01-20 02:45:03'),
(93, 1, 179, '2026-01-20 02:45:03'),
(94, 1, 180, '2026-01-20 02:45:03'),
(95, 1, 220, '2026-01-20 02:45:03'),
(96, 1, 221, '2026-01-20 02:45:03'),
(97, 1, 222, '2026-01-20 02:45:03'),
(98, 1, 223, '2026-01-20 02:45:03'),
(99, 1, 224, '2026-01-20 02:45:03'),
(100, 1, 225, '2026-01-20 02:45:03'),
(101, 1, 226, '2026-01-20 02:45:03'),
(102, 1, 227, '2026-01-20 02:45:03'),
(103, 1, 228, '2026-01-20 02:45:03'),
(104, 1, 229, '2026-01-20 02:45:03'),
(105, 1, 230, '2026-01-20 02:45:03'),
(106, 1, 231, '2026-01-20 02:45:03'),
(107, 1, 232, '2026-01-20 02:45:03'),
(108, 1, 233, '2026-01-20 02:45:03'),
(109, 1, 234, '2026-01-20 02:45:03'),
(110, 1, 235, '2026-01-20 02:45:03'),
(111, 1, 236, '2026-01-20 02:45:03'),
(112, 1, 237, '2026-01-20 02:45:03'),
(113, 1, 238, '2026-01-20 02:45:03'),
(114, 1, 239, '2026-01-20 02:45:03'),
(115, 1, 240, '2026-01-20 02:45:03'),
(116, 1, 241, '2026-01-20 02:45:03'),
(117, 1, 242, '2026-01-20 02:45:03'),
(118, 1, 243, '2026-01-20 02:45:03'),
(119, 1, 47, '2026-01-20 02:45:03'),
(120, 1, 48, '2026-01-20 02:45:03'),
(121, 1, 49, '2026-01-20 02:45:03'),
(122, 1, 50, '2026-01-20 02:45:03'),
(123, 1, 51, '2026-01-20 02:45:03'),
(124, 1, 52, '2026-01-20 02:45:03'),
(125, 1, 53, '2026-01-20 02:45:03'),
(126, 1, 54, '2026-01-20 02:45:03'),
(127, 1, 55, '2026-01-20 02:45:03'),
(128, 1, 56, '2026-01-20 02:45:03'),
(129, 1, 57, '2026-01-20 02:45:03'),
(130, 1, 58, '2026-01-20 02:45:03'),
(131, 1, 59, '2026-01-20 02:45:03'),
(132, 1, 60, '2026-01-20 02:45:03'),
(133, 1, 61, '2026-01-20 02:45:03'),
(134, 1, 62, '2026-01-20 02:45:03'),
(135, 1, 118, '2026-01-20 02:45:03'),
(136, 1, 119, '2026-01-20 02:45:03'),
(137, 1, 120, '2026-01-20 02:45:03'),
(138, 1, 121, '2026-01-20 02:45:03'),
(139, 1, 122, '2026-01-20 02:45:03'),
(140, 1, 123, '2026-01-20 02:45:03'),
(141, 1, 124, '2026-01-20 02:45:03'),
(142, 1, 125, '2026-01-20 02:45:03'),
(143, 1, 126, '2026-01-20 02:45:03'),
(144, 1, 127, '2026-01-20 02:45:03'),
(145, 1, 128, '2026-01-20 02:45:03'),
(146, 1, 129, '2026-01-20 02:45:03'),
(147, 1, 130, '2026-01-20 02:45:03'),
(148, 1, 131, '2026-01-20 02:45:03'),
(149, 1, 132, '2026-01-20 02:45:03'),
(150, 1, 133, '2026-01-20 02:45:03'),
(151, 1, 181, '2026-01-20 02:45:03'),
(152, 1, 182, '2026-01-20 02:45:03'),
(153, 1, 183, '2026-01-20 02:45:03'),
(154, 1, 184, '2026-01-20 02:45:03'),
(155, 1, 185, '2026-01-20 02:45:03'),
(156, 1, 186, '2026-01-20 02:45:03'),
(157, 1, 187, '2026-01-20 02:45:03'),
(158, 1, 188, '2026-01-20 02:45:03'),
(159, 1, 189, '2026-01-20 02:45:03'),
(160, 1, 190, '2026-01-20 02:45:03'),
(161, 1, 191, '2026-01-20 02:45:03'),
(162, 1, 192, '2026-01-20 02:45:03'),
(163, 1, 193, '2026-01-20 02:45:03'),
(164, 1, 194, '2026-01-20 02:45:03'),
(165, 1, 195, '2026-01-20 02:45:03'),
(166, 1, 196, '2026-01-20 02:45:03'),
(167, 1, 244, '2026-01-20 02:45:03'),
(168, 1, 245, '2026-01-20 02:45:03'),
(169, 1, 246, '2026-01-20 02:45:03'),
(170, 1, 247, '2026-01-20 02:45:03'),
(171, 1, 248, '2026-01-20 02:45:03'),
(172, 1, 249, '2026-01-20 02:45:03'),
(173, 1, 250, '2026-01-20 02:45:03'),
(174, 1, 251, '2026-01-20 02:45:03'),
(175, 1, 252, '2026-01-20 02:45:03'),
(176, 1, 253, '2026-01-20 02:45:03'),
(177, 1, 254, '2026-01-20 02:45:03'),
(178, 1, 255, '2026-01-20 02:45:03'),
(179, 1, 256, '2026-01-20 02:45:03'),
(180, 1, 257, '2026-01-20 02:45:03'),
(181, 1, 258, '2026-01-20 02:45:03'),
(182, 1, 259, '2026-01-20 02:45:03');

-- --------------------------------------------------------

--
-- Table structure for table `faculty_profiles`
--

CREATE TABLE `faculty_profiles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  `employee_id` varchar(50) NOT NULL,
  `grade_levels` varchar(255) DEFAULT NULL,
  `course_program_teaching_and_section` varchar(255) DEFAULT NULL,
  `mobile_number` varchar(20) DEFAULT NULL,
  `alternate_email` varchar(255) DEFAULT NULL,
  `office_email` varchar(255) DEFAULT NULL,
  `role` varchar(100) DEFAULT NULL,
  `academic_rank` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `faculty_profiles`
--

INSERT INTO `faculty_profiles` (`id`, `user_id`, `department_id`, `employee_id`, `grade_levels`, `course_program_teaching_and_section`, `mobile_number`, `alternate_email`, `office_email`, `role`, `academic_rank`, `status`, `created_at`) VALUES
(1, 1, 1, 'EMP-2024-001', 'Grade 11', 'GRADE11-A', '9919912366', 'daas@gmail.com', 'denisealia@dihs.edu.ph', 'Teacher', 'Instructor I', 'Active', '2026-01-19 11:51:48');

-- --------------------------------------------------------

--
-- Table structure for table `student_profiles`
--

CREATE TABLE `student_profiles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `student_number` varchar(50) NOT NULL,
  `year_level` int(11) NOT NULL,
  `class_section_id` int(11) DEFAULT NULL,
  `course_program` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_profiles`
--

INSERT INTO `student_profiles` (`id`, `user_id`, `student_number`, `year_level`, `class_section_id`, `course_program`, `created_at`) VALUES
(1, 3, '2025-2-005022', 11, 13, 'STEM', '2026-01-19 11:52:37'),
(2, 4, '2023-2-005044', 7, 1, 'Grade 7', '2026-01-19 15:09:50'),
(3, 5, '2024-2-050403', 9, 8, 'Grade 9', '2026-01-19 16:23:09'),
(4, 6, '2025-5-010203', 10, 10, 'Cookery', '2026-01-20 02:37:01');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('student','faculty','admin') NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `email_verified` tinyint(1) DEFAULT 0,
  `last_login_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `role`, `status`, `email_verified`, `last_login_at`, `created_at`, `updated_at`) VALUES
(1, 'Denise Alia', 'denisealia@dihs.edu.ph', '$2y$10$placeholder_hash_change_me', 'faculty', 'active', 1, NULL, '2026-01-19 11:51:48', '2026-01-19 11:51:48'),
(2, 'System Admin', 'admin@dihs.edu.ph', '$2y$10$placeholder_hash_change_me', 'admin', 'active', 1, NULL, '2026-01-19 11:51:48', '2026-01-19 11:51:48'),
(3, 'Charles Patrick Arias', 'cpmarias@dihs.edu.ph', '$2y$10$/bwN9eWuqK5vrpSxYvizIekl6.T1a0ojClVre3pfrNbLTdTWrgknK', 'student', 'active', 0, '2026-01-20 10:47:28', '2026-01-19 11:52:37', '2026-01-20 02:47:28'),
(4, 'Denise Alia Sernande', 'daasernande@dihs.edu.ph', '$2y$10$Wgfv4b2FlOGencu0v8zD.O/TceyacXSz7zPwZR6/u3cuOhgbph.xW', 'student', 'active', 0, '2026-01-20 09:57:33', '2026-01-19 15:09:50', '2026-01-20 01:57:33'),
(5, 'Julia Chloe Fornal', 'jcfornal@dihs.edu.ph', '$2y$10$NTBFcJLi1W8XBzrM6SjNduTiVaISHI26cj5bu1UOscvlPYBEMUGRC', 'student', 'active', 0, '2026-01-20 00:23:13', '2026-01-19 16:23:09', '2026-01-19 16:23:13'),
(6, 'Ryza Evangelio', 'rmevangelio@dihs.edu.ph', '$2y$10$a9JX83cSEBN/0ipUrI10TeMppWUPXHY1enUBxR1zdIuVWTOB4HdHa', 'student', 'active', 0, '2026-01-20 10:48:09', '2026-01-20 02:37:01', '2026-01-20 02:48:09');

-- --------------------------------------------------------

--
-- Table structure for table `user_settings`
--

CREATE TABLE `user_settings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `receive_email_reminders` tinyint(1) DEFAULT 1,
  `notify_period_close` tinyint(1) DEFAULT 1,
  `profile_visible_to_faculty` tinyint(1) DEFAULT 1,
  `submit_anonymously` tinyint(1) DEFAULT 1,
  `theme_preference` varchar(20) DEFAULT 'light',
  `language_preference` varchar(10) DEFAULT 'en',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_settings`
--

INSERT INTO `user_settings` (`id`, `user_id`, `receive_email_reminders`, `notify_period_close`, `profile_visible_to_faculty`, `submit_anonymously`, `theme_preference`, `language_preference`, `created_at`) VALUES
(1, 3, 1, 1, 1, 1, 'light', 'en', '2026-01-19 11:52:37'),
(2, 4, 1, 1, 1, 1, 'light', 'en', '2026-01-19 15:09:50'),
(3, 5, 1, 1, 1, 1, 'light', 'en', '2026-01-19 16:23:09'),
(4, 6, 1, 1, 1, 1, 'light', 'en', '2026-01-20 02:37:01');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `class_sections`
--
ALTER TABLE `class_sections`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_code` (`code`);

--
-- Indexes for table `course_offerings`
--
ALTER TABLE `course_offerings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_offering` (`course_id`,`class_section_id`),
  ADD KEY `class_section_id` (`class_section_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `faculty_assignments`
--
ALTER TABLE `faculty_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_assignment` (`faculty_user_id`,`course_offering_id`),
  ADD KEY `course_offering_id` (`course_offering_id`);

--
-- Indexes for table `faculty_profiles`
--
ALTER TABLE `faculty_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `employee_id` (`employee_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `department_id` (`department_id`);

--
-- Indexes for table `student_profiles`
--
ALTER TABLE `student_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_number` (`student_number`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `class_section_id` (`class_section_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_settings`
--
ALTER TABLE `user_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `class_sections`
--
ALTER TABLE `class_sections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `course_offerings`
--
ALTER TABLE `course_offerings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=260;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `faculty_assignments`
--
ALTER TABLE `faculty_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=183;

--
-- AUTO_INCREMENT for table `faculty_profiles`
--
ALTER TABLE `faculty_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `student_profiles`
--
ALTER TABLE `student_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `user_settings`
--
ALTER TABLE `user_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `course_offerings`
--
ALTER TABLE `course_offerings`
  ADD CONSTRAINT `course_offerings_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_offerings_ibfk_2` FOREIGN KEY (`class_section_id`) REFERENCES `class_sections` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `faculty_assignments`
--
ALTER TABLE `faculty_assignments`
  ADD CONSTRAINT `faculty_assignments_ibfk_1` FOREIGN KEY (`faculty_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `faculty_assignments_ibfk_2` FOREIGN KEY (`course_offering_id`) REFERENCES `course_offerings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `faculty_profiles`
--
ALTER TABLE `faculty_profiles`
  ADD CONSTRAINT `faculty_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `faculty_profiles_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `student_profiles`
--
ALTER TABLE `student_profiles`
  ADD CONSTRAINT `student_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_profiles_ibfk_2` FOREIGN KEY (`class_section_id`) REFERENCES `class_sections` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `user_settings`
--
ALTER TABLE `user_settings`
  ADD CONSTRAINT `user_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
