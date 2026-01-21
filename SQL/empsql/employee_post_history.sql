-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jan 13, 2026 at 10:13 PM
-- Server version: 8.0.43
-- PHP Version: 7.4.3-4ubuntu2.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pmis_new`
--

-- --------------------------------------------------------

--
-- Table structure for table `employee_post_history`
--

CREATE TABLE `employee_post_history` (
  `id` int NOT NULL,
  `employee_id` int DEFAULT NULL,
  `appointment_date_bs` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `appointment_date_ad` date DEFAULT NULL,
  `hajir_miti_bs` varchar(10) NOT NULL,
  `hajir_miti_ad` varchar(10) NOT NULL,
  `jd` enum('नयाँ नियुक्ती','सरुवा','काज','बढुवा','पदस्थापन') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `appointment_type` enum('स्थायी','करार','अन्य') NOT NULL,
  `level_id` int NOT NULL,
  `service_group_id` int NOT NULL,
  `post_id` int DEFAULT NULL,
  `office_id` int DEFAULT NULL,
  `current_office_id` int DEFAULT NULL,
  `is_office_chief` enum('हो','निमित्त','होइन') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `updated_by` int DEFAULT NULL,
  `updated_at` timestamp(1) NULL DEFAULT CURRENT_TIMESTAMP(1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `employee_post_history`
--

INSERT INTO `employee_post_history` (`id`, `employee_id`, `appointment_date_bs`, `appointment_date_ad`, `hajir_miti_bs`, `hajir_miti_ad`, `jd`, `appointment_type`, `level_id`, `service_group_id`, `post_id`, `office_id`, `current_office_id`, `is_office_chief`, `remarks`, `updated_by`, `updated_at`) VALUES
(15, 31, '2082-04-01', '2025-07-17', '', '', 'सरुवा', 'स्थायी', 5, 4, 26, 2, 2, '', '', 2, '2025-07-23 13:19:49.3'),
(16, 45, '2081-10-10', '2025-01-23', '2081-10-10', '2025-01-23', 'नयाँ नियुक्ती', 'स्थायी', 5, 4, 26, 81, 81, 'होइन', '', 74, '2025-07-23 14:39:33.8'),
(17, 46, '2082-02-13', '2025-05-27', '2082-02-09', '2025-05-23', 'पदस्थापन', 'स्थायी', 4, 4, 17, 2, 2, 'होइन', '', 87, '2025-07-23 15:38:31.0'),
(18, 47, '2081-10-01', '2025-01-14', '2081-10-01', '2025-01-14', 'सरुवा', 'स्थायी', 2, 1, 2, 2, 2, 'होइन', '', 88, '2025-07-23 15:46:13.0'),
(19, 48, '2081-06-02', '2024-09-18', '2081-06-01', '2024-09-17', 'सरुवा', 'स्थायी', 2, 1, 2, 2, 2, 'होइन', '', 88, '2025-07-23 16:01:30.1');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `employee_post_history`
--
ALTER TABLE `employee_post_history`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `employee_post_history`
--
ALTER TABLE `employee_post_history`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=545;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
