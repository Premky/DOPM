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
-- Table structure for table `emp_level`
--

CREATE TABLE `emp_level` (
  `id` int NOT NULL,
  `level_name_np` varchar(50) DEFAULT NULL,
  `emp_rank_np` varchar(50) DEFAULT NULL,
  `order_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `emp_level`
--

INSERT INTO `emp_level` (`id`, `level_name_np`, `emp_rank_np`, `order_id`) VALUES
(1, NULL, 'रा.प.प्रथम', 1),
(2, '', 'रा.प.द्वितीय', 2),
(3, 'सातौ', 'रा.प.तृतीय', 3),
(4, 'पाँचौ', 'रा.प.अनं.प्रथम', 4),
(5, 'चौथो', 'रा.प.अनं.द्वितीय', 5),
(6, '', 'रा.प.अनं.पाँचौ', 6),
(7, '', 'श्रेणी विहीन', 7),
(8, 'तेह्रौं', '', 8),
(9, 'बाह्रौं', '', 9),
(10, 'एघारौं', '', 10),
(11, 'दशौं', '', 11),
(12, 'नवौं', '', 12),
(13, 'आठौं', '', 13),
(14, 'सातौं', '', 14),
(15, 'छैटौं', '', 15),
(16, 'पाँचौ', '', 16),
(17, 'चौथो', '', 17);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `emp_level`
--
ALTER TABLE `emp_level`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `emp_level`
--
ALTER TABLE `emp_level`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
