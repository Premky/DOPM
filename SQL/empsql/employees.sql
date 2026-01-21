-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jan 13, 2026 at 10:12 PM
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
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` int NOT NULL,
  `emp_type` enum('स्थायी','अस्थायी','करार','ज्यालादारी') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sanket_no` char(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `name_in_nepali` char(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `name_in_english` char(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `gender` enum('पुरुष','महिला','अन्य','') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `dob` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `dob_ad` date DEFAULT NULL,
  `married_status` enum('विवाहित','अविवाहित','एकल','') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `mobile_no` char(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` char(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `citizenship_no` char(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `issue_date` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `issue_district_id` int DEFAULT NULL,
  `province_id` int NOT NULL,
  `district_id` int NOT NULL,
  `municipality_id` int NOT NULL,
  `ward_no` int NOT NULL,
  `is_active` tinyint DEFAULT '1',
  `photo_path` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `remarks` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NOT NULL,
  `updated_by` int NOT NULL,
  `updated_at` timestamp NOT NULL,
  `current_office_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `emp_type`, `sanket_no`, `name_in_nepali`, `name_in_english`, `gender`, `dob`, `dob_ad`, `married_status`, `mobile_no`, `email`, `citizenship_no`, `issue_date`, `issue_district_id`, `province_id`, `district_id`, `municipality_id`, `ward_no`, `is_active`, `photo_path`, `remarks`, `created_by`, `created_at`, `updated_by`, `updated_at`, `current_office_id`) VALUES
(31, 'स्थायी', '249586', 'प्रेम कुमार यादव', 'Prem Kumar Yadav', 'पुरुष', '2057-10-24', '2001-02-06', 'अविवाहित', '9852091511', 'premnsa108@gmail.com', '16-01-74-01301', '2074-02-10', 15, 2, 15, 151, 6, 1, '/uploads/emp_photo/249586_Prem_Kumar_Yadav_2025-07-23.jpg', '', 2, '2025-07-23 13:19:49', 2, '2025-07-23 13:19:49', 2),
(45, 'स्थायी', '252387', 'रविन कार्की', 'Rabin Karki', 'पुरुष', '2048-11-06', '1992-02-18', 'विवाहित', '9841354210', 'ravs.karki@gmail.com', '751001/5171', '2066-01-22', 77, 7, 77, 748, 9, 1, '/uploads/emp_photo/252387_Rabin_Karki_2025-07-23.jpg', '', 74, '2025-07-23 14:39:34', 74, '2025-07-23 14:39:34', 81),
(46, 'स्थायी', '223943', 'उदेन सुवेदी', 'Uden Subedi', 'पुरुष', '2055-03-07', '1998-06-21', 'विवाहित', '9842681298', 'udensub@dopm.gov.np', '0', '2062-02-02', 4, 1, 4, 41, 10, 1, '/uploads/emp_photo/223943_Uden_Subedi_2025-07-23.jpg', '', 87, '2025-07-23 15:38:31', 87, '2025-07-23 15:38:31', 2),
(47, 'स्थायी', '191753', 'कल्पना घिमिरे नेपाल', 'Kalpana Ghimire Nepal', 'महिला', '2040-01-05', '1983-04-18', 'विवाहित', '9855046777', 'bandi@dopm.gov.np', '7611', '2060-12-06', 35, 3, 28, 332, 8, 1, '/uploads/emp_photo/191753_Kalpana_Ghimire_Nepal_2025-07-23.jpg', '', 88, '2025-07-23 15:46:13', 88, '2025-07-23 15:46:13', 2),
(48, 'स्थायी', '184035', 'टेककुमार रेग्मी', 'Tekkumar Regmi', 'पुरुष', '2032-12-08', '1976-03-21', 'विवाहित', '9851129176', 'tekregmi32@gmail.com', '341521167', '2059-06-19', 4, 1, 4, 35, 3, 1, '/uploads/emp_photo/184035_Tekkumar_Regmi_2025-07-23.jpg', '', 88, '2025-07-23 16:01:30', 88, '2025-07-23 16:01:30', 2);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sanket_no` (`sanket_no`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=662;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
