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
-- Table structure for table `emp_post`
--

CREATE TABLE `emp_post` (
  `id` int NOT NULL,
  `post_name_np` varchar(50) NOT NULL,
  `service_group_id` int NOT NULL,
  `order_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `emp_post`
--

INSERT INTO `emp_post` (`id`, `post_name_np`, `service_group_id`, `order_id`) VALUES
(1, 'महानिर्देशक', 1, 1),
(2, 'निर्देशक', 0, 5),
(3, 'प्र.मे.सु.', 0, 15),
(4, 'क.डर्माटोलोजिष्ट', 0, 20),
(5, 'मेडिकल सुपरिटेन्डेन्ट', 0, 25),
(6, 'मेडिकल अधिकृत', 0, 30),
(7, 'ब.नर्सिङ अधिकृ', 0, 35),
(8, 'शाखा अधिकृत', 0, 40),
(9, 'कानून अधिकृत', 0, 45),
(10, 'लेखा अधिकृत', 0, 50),
(11, 'कारागार प्रशासक', 0, 55),
(12, 'मे.अ.', 0, 60),
(13, 'सि.अ.हे.व.', 0, 65),
(14, 'रे.ग्रा.नि.', 0, 70),
(15, 'जनस्वास्थ्य निरीक्षक', 0, 75),
(16, 'नायव सुब्बा', 0, 80),
(17, 'कम्प्युटर अपरेटर', 0, 85),
(18, 'लेखापाल', 0, 90),
(19, 'अ.हे.व', 0, 95),
(20, 'हे.अ.', 0, 100),
(21, 'सि.अ.न.मी.', 0, 105),
(22, 'स्टाफ नर्स', 0, 110),
(23, 'ल्याब टेक्निसीयन', 0, 115),
(24, 'फार्मेसी सुपरभाइजर', 0, 120),
(25, 'खरिदार', 0, 125),
(26, 'सहायक कम्प्युटर अपरेटर', 0, 130),
(27, 'सहायक लेखापाल', 0, 135),
(28, 'कार्यालय सहयोगी', 0, 140),
(29, 'हलुका सवारी चालक', 0, 150),
(30, 'उपसचिव (लेखा)', 0, 10);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `emp_post`
--
ALTER TABLE `emp_post`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `emp_post`
--
ALTER TABLE `emp_post`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
