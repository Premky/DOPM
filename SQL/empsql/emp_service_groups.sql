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
-- Table structure for table `emp_service_groups`
--

CREATE TABLE `emp_service_groups` (
  `id` int NOT NULL,
  `service_name_np` enum('नेपाल प्रशासन','नेपाल विविध','नेपाल स्वास्थ्य','नेपाल इञ्जिनियरिङ्ग','नेपाल न्याय') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `group_name_np` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `emp_service_groups`
--

INSERT INTO `emp_service_groups` (`id`, `service_name_np`, `group_name_np`) VALUES
(1, 'नेपाल प्रशासन', 'सामान्य प्रशासन'),
(2, 'नेपाल प्रशासन', 'लेखा'),
(3, 'नेपाल इञ्जिनियरिङ्ग', 'मेकानिकल इञ्जिनियरिङ्ग'),
(4, 'नेपाल विविध', NULL),
(5, 'नेपाल स्वास्थ्य', NULL),
(6, 'नेपाल न्याय', 'कानून');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `emp_service_groups`
--
ALTER TABLE `emp_service_groups`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `emp_service_groups`
--
ALTER TABLE `emp_service_groups`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
