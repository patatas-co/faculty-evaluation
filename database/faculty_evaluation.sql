-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 22, 2026 at 03:04 AM
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
-- Table structure for table `evaluations`
--

CREATE TABLE `evaluations` (
  `id` int(11) NOT NULL,
  `faculty_assignment_id` int(11) NOT NULL,
  `student_user_id` int(11) DEFAULT NULL,
  `rating_clarity` tinyint(1) NOT NULL CHECK (`rating_clarity` between 1 and 5),
  `rating_feedback` tinyint(1) NOT NULL CHECK (`rating_feedback` between 1 and 5),
  `rating_engagement` tinyint(1) NOT NULL CHECK (`rating_engagement` between 1 and 5),
  `rating_support` tinyint(1) NOT NULL CHECK (`rating_support` between 1 and 5),
  `strengths` text DEFAULT NULL,
  `opportunities` text DEFAULT NULL,
  `is_anonymous` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(191, 11, 193, '2026-02-22 01:58:47');

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
(4, 11, 1, 'EMP-2024-00010', NULL, NULL, NULL, NULL, NULL, NULL, 'Instructor I', 'Active', '2026-02-22 01:58:47');

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
(5, 8, '2021-2-005033', 7, 19, 'Grade 7 - Abelardo', '2026-02-22 01:46:06'),
(6, 12, '2023-2-005044', 9, 24, 'Cookery', '2026-02-22 01:59:46');

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
(2, 'System Admin', 'admin@dihs.edu.ph', '$2y$10$fsy7g4i/UOXHwbXj99u4lO2cPevszGM9DohbXFHFz7Daque2Cc/XK', 'admin', 'active', 1, '2026-02-22 10:02:19', '2026-01-19 11:51:48', '2026-02-22 02:02:19'),
(8, 'Denise Alia Sernande', 'daasernande@dihs.edu.ph', '$2y$10$rVrInAO1CPqr75ByYK43eu.ezjpxJBS0dZAsyj2J1mLsgNnAsx.Le', 'student', 'active', 0, '2026-02-22 09:47:55', '2026-02-22 01:46:06', '2026-02-22 01:47:55'),
(11, 'Chloe Fornal', 'jcfornal@dihs.edu.com', '$2y$10$/VE3wwm/XKBOmbgcTY7My.VCEzP6qkVYYPAd5ZVcUyRSnQMRA.q02', 'faculty', 'active', 1, NULL, '2026-02-22 01:58:47', '2026-02-22 01:58:47'),
(12, 'Charles Patrick Arias', 'cpmarias@dihs.edu.ph', '$2y$10$ETXBX5lUiSuQbwRow8TmIOC.nQsVlKZcaEWaKd7L/aE4Zyv3MuGga', 'student', 'active', 0, '2026-02-22 09:59:50', '2026-02-22 01:59:46', '2026-02-22 01:59:50');

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
(6, 8, 1, 1, 1, 1, 'light', 'en', '2026-02-22 01:46:06'),
(8, 11, 1, 1, 1, 1, 'light', 'en', '2026-02-22 01:58:47'),
(9, 12, 1, 1, 1, 1, 'light', 'en', '2026-02-22 01:59:46');

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
-- Indexes for table `evaluations`
--
ALTER TABLE `evaluations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_eval` (`faculty_assignment_id`,`student_user_id`),
  ADD KEY `fk_eval_assignment` (`faculty_assignment_id`),
  ADD KEY `fk_eval_student` (`student_user_id`);

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
-- AUTO_INCREMENT for table `evaluations`
--
ALTER TABLE `evaluations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faculty_assignments`
--
ALTER TABLE `faculty_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=192;

--
-- AUTO_INCREMENT for table `faculty_profiles`
--
ALTER TABLE `faculty_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `student_profiles`
--
ALTER TABLE `student_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `user_settings`
--
ALTER TABLE `user_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

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
-- Constraints for table `evaluations`
--
ALTER TABLE `evaluations`
  ADD CONSTRAINT `fk_eval_assignment` FOREIGN KEY (`faculty_assignment_id`) REFERENCES `faculty_assignments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_eval_student` FOREIGN KEY (`student_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

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
