-- =============================================
-- Employee Management System - Database Schema
-- =============================================

-- Main Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Basic Info
    emp_type INT COMMENT '1=Permanent, 2=Contract, 3=Daily',
    sanket_no VARCHAR(50) UNIQUE NOT NULL,
    name_in_english VARCHAR(255) NOT NULL,
    name_in_nepali VARCHAR(255) NOT NULL,
    
    -- Personal Info
    gender ENUM('M', 'F', 'O') COMMENT 'Male, Female, Other',
    dob DATE,
    dob_ad DATE,
    married_status VARCHAR(50),
    
    -- Contact Info
    mobile_no VARCHAR(20),
    email VARCHAR(255),
    
    -- Citizenship Info
    citizenship_no VARCHAR(50),
    issue_date DATE,
    issue_district_id INT,
    
    -- Address Info
    province_id INT,
    district_id INT,
    municipality_id INT,
    ward_no INT,
    
    -- Office & Photo
    current_office_id INT,
    photo_path VARCHAR(500),
    
    -- Metadata
    remarks TEXT,
    is_active TINYINT DEFAULT 1,
    
    created_by INT,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_sanket_no (sanket_no),
    INDEX idx_name_english (name_in_english),
    INDEX idx_email (email),
    INDEX idx_office (current_office_id),
    INDEX idx_active (is_active),
    INDEX idx_emp_type (emp_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Employee Job Details Table
CREATE TABLE IF NOT EXISTS emp_jd (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Reference
    emp_id INT NOT NULL,
    
    -- Job Details
    post_id INT,
    level_id INT,
    service_group_id INT,
    
    -- Dates
    start_date DATE,
    end_date DATE,
    appointment_date_ad DATE,
    appointment_date_bs VARCHAR(20),
    hajir_miti_ad DATE,
    hajir_miti_bs VARCHAR(20),
    
    -- Office Info
    current_office_id INT,
    is_office_chief TINYINT DEFAULT 0,
    
    -- Metadata
    remarks TEXT,
    is_active TINYINT DEFAULT 1,
    
    created_by INT,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_emp_jd_employee FOREIGN KEY (emp_id) 
        REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_emp_jd_office FOREIGN KEY (current_office_id) 
        REFERENCES offices(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_emp_id (emp_id),
    INDEX idx_start_date (start_date),
    INDEX idx_office (current_office_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Employee Transfer History Table
CREATE TABLE IF NOT EXISTS emp_transfer_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Reference
    emp_id INT NOT NULL,
    
    -- Transfer Info
    from_office_id INT,
    to_office_id INT,
    transfer_date DATE,
    transfer_date_bs VARCHAR(20),
    
    -- Details
    transfer_reason VARCHAR(255),
    remarks TEXT,
    
    created_by INT,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_emp_transfer_employee FOREIGN KEY (emp_id) 
        REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_emp_transfer_from_office FOREIGN KEY (from_office_id) 
        REFERENCES offices(id) ON DELETE SET NULL,
    CONSTRAINT fk_emp_transfer_to_office FOREIGN KEY (to_office_id) 
        REFERENCES offices(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_emp_id (emp_id),
    INDEX idx_from_office (from_office_id),
    INDEX idx_to_office (to_office_id),
    INDEX idx_transfer_date (transfer_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Employee Leave Record Table
CREATE TABLE IF NOT EXISTS emp_leave_record (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Reference
    emp_id INT NOT NULL,
    
    -- Leave Info
    leave_type_id INT,
    leave_type_name VARCHAR(100),
    
    -- Dates
    start_date DATE,
    end_date DATE,
    no_of_days INT,
    
    -- Details
    reason TEXT,
    status VARCHAR(50) COMMENT 'pending, approved, rejected',
    approved_by INT,
    approval_date DATE,
    
    remarks TEXT,
    
    created_by INT,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Key
    CONSTRAINT fk_emp_leave_employee FOREIGN KEY (emp_id) 
        REFERENCES employees(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_emp_id (emp_id),
    INDEX idx_status (status),
    INDEX idx_start_date (start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Employee Performance Review Table
CREATE TABLE IF NOT EXISTS emp_performance_review (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Reference
    emp_id INT NOT NULL,
    
    -- Review Info
    review_period_start DATE,
    review_period_end DATE,
    
    -- Ratings
    performance_rating DECIMAL(3,2) COMMENT 'Out of 5',
    conduct_rating DECIMAL(3,2),
    attendance_rating DECIMAL(3,2),
    
    -- Details
    reviewer_name VARCHAR(255),
    reviewer_id INT,
    comments TEXT,
    recommendations TEXT,
    
    created_by INT,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Key
    CONSTRAINT fk_emp_review_employee FOREIGN KEY (emp_id) 
        REFERENCES employees(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_emp_id (emp_id),
    INDEX idx_review_period (review_period_start)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Employee Attendance Table
CREATE TABLE IF NOT EXISTS emp_attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Reference
    emp_id INT NOT NULL,
    
    -- Attendance Info
    attendance_date DATE,
    status ENUM('present', 'absent', 'leave', 'late', 'half-day') DEFAULT 'present',
    
    -- Times
    check_in_time TIME,
    check_out_time TIME,
    
    -- Details
    remarks TEXT,
    
    created_by INT,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Key
    CONSTRAINT fk_emp_attendance_employee FOREIGN KEY (emp_id) 
        REFERENCES employees(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_emp_id (emp_id),
    INDEX idx_attendance_date (attendance_date),
    INDEX idx_status (status),
    UNIQUE KEY unique_attendance (emp_id, attendance_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Employee Salary/Payroll Table
CREATE TABLE IF NOT EXISTS emp_payroll (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Reference
    emp_id INT NOT NULL,
    
    -- Period
    payroll_month INT,
    payroll_year INT,
    
    -- Amounts
    basic_salary DECIMAL(12,2),
    allowances DECIMAL(12,2),
    deductions DECIMAL(12,2),
    net_salary DECIMAL(12,2),
    
    -- Details
    status VARCHAR(50) COMMENT 'pending, processed, paid',
    payment_date DATE,
    remarks TEXT,
    
    created_by INT,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Key
    CONSTRAINT fk_emp_payroll_employee FOREIGN KEY (emp_id) 
        REFERENCES employees(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_emp_id (emp_id),
    INDEX idx_payroll_period (payroll_year, payroll_month),
    INDEX idx_status (status),
    UNIQUE KEY unique_payroll (emp_id, payroll_month, payroll_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Employee Training Table
CREATE TABLE IF NOT EXISTS emp_training (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Reference
    emp_id INT NOT NULL,
    
    -- Training Info
    training_name VARCHAR(255),
    training_type VARCHAR(100),
    
    -- Dates
    start_date DATE,
    end_date DATE,
    duration_days INT,
    
    -- Details
    institution_name VARCHAR(255),
    location VARCHAR(255),
    trainer_name VARCHAR(255),
    
    -- Results
    certificate_obtained TINYINT DEFAULT 0,
    certificate_number VARCHAR(100),
    grade VARCHAR(20),
    
    remarks TEXT,
    
    created_by INT,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Key
    CONSTRAINT fk_emp_training_employee FOREIGN KEY (emp_id) 
        REFERENCES employees(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_emp_id (emp_id),
    INDEX idx_training_type (training_type),
    INDEX idx_start_date (start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Employee Promotion History Table
CREATE TABLE IF NOT EXISTS emp_promotion_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Reference
    emp_id INT NOT NULL,
    
    -- Promotion Info
    from_post_id INT,
    to_post_id INT,
    from_level_id INT,
    to_level_id INT,
    
    -- Promotion Details
    promotion_date DATE,
    promotion_date_bs VARCHAR(20),
    promotion_order_no VARCHAR(100),
    
    -- Reason
    promotion_reason TEXT,
    
    created_by INT,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Key
    CONSTRAINT fk_emp_promotion_employee FOREIGN KEY (emp_id) 
        REFERENCES employees(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_emp_id (emp_id),
    INDEX idx_promotion_date (promotion_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== SUPPORTING LOOKUP TABLES (if not already exist) =====

CREATE TABLE IF NOT EXISTS emp_level (
    id INT PRIMARY KEY AUTO_INCREMENT,
    level_name_np VARCHAR(100),
    level_name_en VARCHAR(100),
    emp_rank_np VARCHAR(100),
    emp_rank_en VARCHAR(100),
    order_id INT,
    is_active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS emp_post (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_name_np VARCHAR(255),
    post_name_en VARCHAR(255),
    order_id INT,
    is_active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS emp_service_groups (
    id INT PRIMARY KEY AUTO_INCREMENT,
    service_name_np VARCHAR(100),
    service_name_en VARCHAR(100),
    group_name_np VARCHAR(100),
    group_name_en VARCHAR(100),
    is_active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== MIGRATION SCRIPT TO UPDATE EXISTING TABLES =====

-- If emp_level table doesn't have all columns, add them
ALTER TABLE emp_level ADD COLUMN IF NOT EXISTS level_name_np VARCHAR(100);
ALTER TABLE emp_level ADD COLUMN IF NOT EXISTS emp_rank_np VARCHAR(100);
ALTER TABLE emp_post ADD COLUMN IF NOT EXISTS order_id INT;
ALTER TABLE emp_service_groups ADD COLUMN IF NOT EXISTS service_name_np VARCHAR(100);
ALTER TABLE emp_service_groups ADD COLUMN IF NOT EXISTS group_name_np VARCHAR(100);

-- Ensure employees table has required columns
ALTER TABLE employees ADD COLUMN IF NOT EXISTS emp_type INT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS is_active TINYINT DEFAULT 1;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS dob_ad DATE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS photo_path VARCHAR(500);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS current_office_id INT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS citizenship_no VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS issue_date DATE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS issue_district_id INT;

-- Add indexes if not exists
ALTER TABLE employees ADD INDEX IF NOT EXISTS idx_sanket_no (sanket_no);
ALTER TABLE employees ADD INDEX IF NOT EXISTS idx_office (current_office_id);
ALTER TABLE employees ADD UNIQUE INDEX IF NOT EXISTS unique_sanket_no (sanket_no);

COMMIT;
