-- =====================================================================
-- CRM (إدارة علاقات العملاء) Database Schema for MySQL / XAMPP
-- Designed for Laravel 12 & Spatie Permissions Compatibility
-- Colors Reference: Primary: Dark Blue (#0B192C), Secondary: Orange (#FF6500)
-- Language Support: Bilingual Arabic RTL & English
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `crm_system` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `crm_system`;

-- Disable Foreign Key checks temporarily to allow drop/recreate
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `settings`;
DROP TABLE IF EXISTS `activity_logs`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `tasks`;
DROP TABLE IF EXISTS `invoices`;
DROP TABLE IF EXISTS `quotations`;
DROP TABLE IF EXISTS `deals`;
DROP TABLE IF EXISTS `opportunities`;
DROP TABLE IF EXISTS `leads`;
DROP TABLE IF EXISTS `contracts`;
DROP TABLE IF EXISTS `company_contacts`;
DROP TABLE IF EXISTS `company_branches`;
DROP TABLE IF EXISTS `companies`;
DROP TABLE IF EXISTS `clients`;
DROP TABLE IF EXISTS `permission_role`;
DROP TABLE IF EXISTS `permissions`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `roles`;

SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- 1. ROLES & PERMISSIONS (RBAC Spatie Mock)
-- ==========================================

CREATE TABLE `roles` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `display_name_ar` VARCHAR(100) NOT NULL,
  `display_name_en` VARCHAR(100) NOT NULL,
  `guard_name` VARCHAR(50) DEFAULT 'web',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `permissions` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `group_name` VARCHAR(50) NOT NULL,
  `display_name_ar` VARCHAR(100) NOT NULL,
  `display_name_en` VARCHAR(100) NOT NULL,
  `guard_name` VARCHAR(50) DEFAULT 'web',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `permission_role` (
  `role_id` BIGINT UNSIGNED NOT NULL,
  `permission_id` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`role_id`, `permission_id`),
  FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 2. USERS TABLE
-- ==========================================

CREATE TABLE `users` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role_id` BIGINT UNSIGNED NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `avatar` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 3. COMPANIES & CORRESPONDING ENTITIES
-- ==========================================

CREATE TABLE `companies` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `website` VARCHAR(255) DEFAULT NULL,
  `industry` VARCHAR(100) DEFAULT NULL,
  `logo` VARCHAR(255) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_companies_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `company_branches` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `address` TEXT DEFAULT NULL,
  `manager_name` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `company_contacts` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `position` VARCHAR(150) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `contracts` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `value` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `status` ENUM('active', 'expired', 'under_review', 'terminated') DEFAULT 'active',
  `file_path` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  INDEX `idx_contracts_dates` (`start_date`, `end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 4. CLIENTS (إدارة العملاء)
-- ==========================================

CREATE TABLE `clients` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `company_name` VARCHAR(255) DEFAULT NULL,
  `company_id` BIGINT UNSIGNED DEFAULT NULL,
  `status` ENUM('new', 'lead', 'negotiating', 'active_client', 'inactive') DEFAULT 'new',
  `type` ENUM('individual', 'corporate') DEFAULT 'individual',
  `address` TEXT DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `manager_id` BIGINT UNSIGNED DEFAULT NULL,
  `archived_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_clients_search` (`name`, `email`, `phone`),
  INDEX `idx_clients_archived` (`archived_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 5. LEADS & OPPORTUNITIES & DEALS
-- ==========================================

CREATE TABLE `leads` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `client_id` BIGINT UNSIGNED NOT NULL,
  `source` VARCHAR(100) DEFAULT NULL, -- Social Media, Website, Direct, Referral
  `score` INT DEFAULT '50', -- Lead score 1-100
  `status` ENUM('new', 'contacted', 'qualified', 'unqualified') DEFAULT 'new',
  `expected_revenue` DECIMAL(15,2) DEFAULT '0.00',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  INDEX `idx_leads_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `opportunities` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `lead_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `stage` ENUM('discovery', 'proposal', 'negociation', 'win_pending', 'closed_won', 'closed_lost') DEFAULT 'discovery',
  `probability` INT DEFAULT '10', -- 10% to 100%
  `estimated_value` DECIMAL(15,2) NOT NULL DEFAULT '0.00',
  `close_date` DATE DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `deals` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `opportunity_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `value` DECIMAL(15,2) NOT NULL,
  `status` ENUM('active', 'won', 'lost', 'paused') DEFAULT 'active',
  `contract_signed` TINYINT(1) DEFAULT '0',
  `closed_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`opportunity_id`) REFERENCES `opportunities` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 6. QUOTATIONS & INVOICES
-- ==========================================

CREATE TABLE `quotations` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `client_id` BIGINT UNSIGNED NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `total_amount` DECIMAL(15,2) NOT NULL,
  `discount` DECIMAL(15,2) DEFAULT '0.00',
  `status` ENUM('draft', 'sent', 'accepted', 'rejected', 'expired') DEFAULT 'draft',
  `valid_until` DATE DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `invoices` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `client_id` BIGINT UNSIGNED NOT NULL,
  `invoice_number` VARCHAR(100) NOT NULL UNIQUE,
  `total_amount` DECIMAL(15,2) NOT NULL,
  `tax` DECIMAL(15,2) DEFAULT '0.00',
  `status` ENUM('draft', 'unpaid', 'partially_paid', 'paid', 'overdue') DEFAULT 'unpaid',
  `due_date` DATE NOT NULL,
  `paid_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  INDEX `idx_invoices_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 7. TASKS & CALENDAR BINDINGS
-- ==========================================

CREATE TABLE `tasks` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `priority` ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  `status` ENUM('pending', 'in_progress', 'completed', 'canceled') DEFAULT 'pending',
  `due_date` DATETIME NOT NULL,
  `assigned_to_id` BIGINT UNSIGNED DEFAULT NULL,
  `client_id` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`assigned_to_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
  INDEX `idx_tasks_due` (`due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 8. NOTIFICATIONS & ALERTS
-- ==========================================

CREATE TABLE `notifications` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `title_ar` VARCHAR(255) NOT NULL,
  `title_en` VARCHAR(255) NOT NULL,
  `content_ar` TEXT NOT NULL,
  `content_en` TEXT NOT NULL,
  `type` ENUM('task_alert', 'lead_update', 'invoice_paid', 'system_event') DEFAULT 'system_event',
  `is_read` TINYINT(1) DEFAULT '0',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_notifications_user_read` (`user_id`, `is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 9. ACTIVITY LOGS (سجل العمليات)
-- ==========================================

CREATE TABLE `activity_logs` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED DEFAULT NULL,
  `action` ENUM('login', 'logout', 'create', 'update', 'delete', 'archive', 'unarchive', 'export', 'import') NOT NULL,
  `target_type` VARCHAR(100) DEFAULT NULL, -- 'Client', 'Invoice', 'Deal', 'Task'
  `target_id` BIGINT UNSIGNED DEFAULT NULL,
  `description_ar` VARCHAR(255) NOT NULL,
  `description_en` VARCHAR(255) NOT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_logs_user` (`user_id`),
  INDEX `idx_logs_action` (`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 10. SETTINGS TABLE
-- ==========================================

CREATE TABLE `settings` (
  `key` VARCHAR(100) PRIMARY KEY,
  `value` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================================
-- SEED DATA (بيانات تجريبية وافتراضية للتشغيل الفوري)
-- =====================================================================

-- 1. Permitted Roles
INSERT INTO `roles` (`id`, `name`, `display_name_ar`, `display_name_en`) VALUES
(1, 'super_admin', 'مدير النظام', 'System Administrator'),
(2, 'sales_manager', 'مدير المبيعات', 'Sales Manager'),
(3, 'sales_employee', 'موظف مبيعات', 'Sales Representative'),
(4, 'supervisor', 'مشرف', 'Supervisor'),
(5, 'regular_user', 'مستخدم عادي', 'Regular User');

-- 2. System Permissions
INSERT INTO `permissions` (`id`, `name`, `group_name`, `display_name_ar`, `display_name_en`) VALUES
-- Clients
(1, 'view_clients', 'clients', 'عرض العملاء', 'View Clients'),
(2, 'create_clients', 'clients', 'إضافة عملاء', 'Create Clients'),
(3, 'edit_clients', 'clients', 'تعديل العملاء', 'Edit Clients'),
(4, 'delete_clients', 'clients', 'حذف العملاء', 'Delete Clients'),
(5, 'archive_clients', 'clients', 'أرشفة العملاء', 'Archive Clients'),
(6, 'import_export_clients', 'clients', 'استيراد وتصدير العملاء', 'Import / Export Clients'),
-- Companies
(7, 'manage_companies', 'companies', 'إدارة الشركات والفروع والعقود', 'Manage Companies, Branches & Contracts'),
-- Sales & Financials
(8, 'view_sales', 'sales', 'عرض المبيعات والصفقات', 'View Sales & Deals'),
(9, 'manage_leads_deals', 'sales', 'إدارة الفرص والصفقات', 'Manage Leads & Deals'),
(10, 'manage_invoices', 'sales', 'إصدار وإدارة الفواتير والعروض', 'Manage Invoices & Quotations'),
-- Tasks & Calendars
(11, 'manage_tasks', 'tasks', 'إدارة المهام والتقويم المشترك', 'Manage Tasks & Calendars'),
-- Settings
(12, 'manage_settings', 'settings', 'إدارة إعدادات النظام المتقدمة والنسخ الاحتياطي', 'Manage System Settings & Backups'),
-- Users
(13, 'manage_users', 'users', 'إدارة المستخدمين والصلاحيات', 'Manage Users & Permissions');

-- 3. Link Permissions with Admin and Sales roles
-- Super Admin (all permissions)
INSERT INTO `permission_role` (`role_id`, `permission_id`) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10), (1, 11), (1, 12), (1, 13);

-- Sales Manager
INSERT INTO `permission_role` (`role_id`, `permission_id`) VALUES
(2, 1), (2, 2), (2, 3), (2, 5), (2, 6), (2, 7), (2, 8), (2, 9), (2, 10), (2, 11);

-- Sales Employee
INSERT INTO `permission_role` (`role_id`, `permission_id`) VALUES
(3, 1), (3, 2), (3, 3), (3, 8), (3, 9), (3, 11);

-- Supervisor
INSERT INTO `permission_role` (`role_id`, `permission_id`) VALUES
(4, 1), (4, 7), (4, 8), (4, 11);

-- 4. Sample Users (Passwords bcrypt of '123456')
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role_id`, `phone`, `status`) VALUES
(1, 'أحمد المدير', 'admin@crm.com', '$2y$12$Z0bWqGjIu0Z3A0y1Z78AieZqH7lI/nS0yq4Fm9QzE0vU7M51A9A2S', 1, '+966501234567', 'active'),
(2, 'سارة الحميد', 'sara.sales@crm.com', '$2y$12$Z0bWqGjIu0Z3A0y1Z78AieZqH7lI/nS0yq4Fm9QzE0vU7M51A9A2S', 2, '+966507654321', 'active'),
(3, 'خالد السليمان', 'khaled.emp@crm.com', '$2y$12$Z0bWqGjIu0Z3A0y1Z78AieZqH7lI/nS0yq4Fm9QzE0vU7M51A9A2S', 3, '+966504567890', 'active');

-- 5. Default Settings
INSERT INTO `settings` (`key`, `value`) VALUES
('company_name_ar', 'شركة الحلول البرمجية الفائقة'),
('company_name_en', 'Hyper Software Solutions Corp'),
('address_ar', 'الرياض، المملكة العربية السعودية'),
('address_en', 'Riyadh, Kingdom of Saudi Arabia'),
('email', 'info@hypersolutions.com'),
('phone', '+966112223333'),
('tax_rate', '15'),
('currency_ar', 'ر.س'),
('currency_en', 'SAR'),
('primary_color', '#0B192C'),
('secondary_color', '#FF6500'),
('mail_driver', 'smtp'),
('mail_host', 'smtp.mailtrap.io'),
('mail_port', '2525'),
('mail_username', 'crm-notify'),
('mail_encryption', 'tls'),
('backup_interval', 'daily');

-- 6. Sample Companies
INSERT INTO `companies` (`id`, `name`, `email`, `phone`, `website`, `industry`, `address`) VALUES
(1, 'مجموعة الراجحي الاستثمارية', 'info@alrajhigroup.com', '920011122', 'www.alrajhigroup.com', 'الاستثمار والمقاولات', 'الرياض، العليا'),
(2, 'شركة الاتصالات السعودية (STC)', 'corporate@stc.com.sa', '900', 'www.stc.com.sa', 'الاتصالات والتقنية', 'الرياض، مجمع الملك عبدالعزيز للاتصالات');

-- 7. Corporate Branches and Contacts
INSERT INTO `company_branches` (`company_id`, `name`, `city`, `address`, `manager_name`, `phone`) VALUES
(1, 'الفرع الرئيسي', 'الرياض', 'طريق الملك فهد', 'عبدالرحمن الراجحي', '+966500000001'),
(1, 'فرع المنطقة الغربية', 'جدة', 'شارع التحلية', 'سعيد الغامدي', '+966500000002');

INSERT INTO `company_contacts` (`company_id`, `name`, `position`, `email`, `phone`) VALUES
(1, 'مروان العتيبي', 'مدير المشتريات', 'm.otaibi@alrajhigroup.com', '+966551234511'),
(2, 'م. فهد القرني', 'مدير البنية التحتية والشبكات', 'f.qarni@stc.com.sa', '+966551234522');

-- 8. Contracts
INSERT INTO `contracts` (`company_id`, `title`, `value`, `start_date`, `end_date`, `status`) VALUES
(1, 'عقد توريد برمجيات سحابية وإدارة شبكات', 450000.00, '2026-01-01', '2026-12-31', 'active'),
(2, 'عقد استشارات فنية وتحليل أمان سيرفرات', 120000.00, '2026-03-01', '2026-09-01', 'active');

-- 9. Sample Clients (leads and active ones)
INSERT INTO `clients` (`id`, `name`, `email`, `phone`, `company_name`, `company_id`, `status`, `type`, `manager_id`) VALUES
(1, 'عبدالرحمن الشهري', 'shahri@gmail.com', '+966501112223', 'مجموعة الراجحي الاستثمارية', 1, 'active_client', 'corporate', 2),
(2, 'خليل اليافعي', 'yafei@hotmail.com', '+966502223334', 'شركة الاتصالات السعودية (STC)', 2, 'negotiating', 'corporate', 3),
(3, 'فيصل المطيري', 'faisal.m@stc.com.sa', '+966503334445', 'شركة الاتصالات السعودية (STC)', 2, 'lead', 'corporate', 3),
(4, 'نواف العبدالله', 'nawaf@example.com', '+966504445556', 'مؤسسة الابتكارات المتجددة', NULL, 'new', 'individual', 2);

-- 10. Sample Leads & Opportunities & Deals
INSERT INTO `leads` (`id`, `client_id`, `source`, `score`, `status`, `expected_revenue`) VALUES
(1, 2, 'Website', 85, 'qualified', 75000.00),
(2, 3, 'Social Media', 60, 'qualified', 50000.00),
(3, 4, 'Referral', 40, 'new', 20000.00);

INSERT INTO `opportunities` (`id`, `lead_id`, `title`, `stage`, `probability`, `estimated_value`, `close_date`) VALUES
(1, 1, 'ترقية تراخيص سيرفر STC', 'proposal', 60, 75000.00, '2026-07-15'),
(2, 2, 'تطبيق الهاتف لخدمات العملاء STC', 'discovery', 30, 50000.00, '2026-09-30');

INSERT INTO `deals` (`id`, `opportunity_id`, `title`, `value`, `status`, `contract_signed`) VALUES
(1, 1, 'صفقة تراخص اس تي سي المرحلة الأولى', 75000.00, 'active', 0);

-- 11. Quotations and Invoices
INSERT INTO `quotations` (`id`, `client_id`, `subject`, `total_amount`, `discount`, `status`, `valid_until`) VALUES
(1, 2, 'عرض السعر المتكامل لتطوير البرامج والمقاسم', 80000.00, '5000.00', 'sent', '2026-08-01');

INSERT INTO `invoices` (`id`, `client_id`, `invoice_number`, `total_amount`, `tax`, `status`, `due_date`) VALUES
(1, 1, 'INV-2026-0001', 517500.00, 67500.00, 'paid', '2026-04-30'),
(2, 2, 'INV-2026-0002', 23000.00, 3000.00, 'unpaid', '2026-06-30');

-- 12. Tasks
INSERT INTO `tasks` (`id`, `title`, `description`, `priority`, `status`, `due_date`, `assigned_to_id`, `client_id`) VALUES
(1, 'سلسلة مقابلات STC الفنية لتحديد المتطلبات الأساسية', 'عقد اجتماع مراجعة عبر Zoom لمناقشة التفاصيل وتنزيل التراخيص واحتياجات السيرفرات', 'high', 'in_progress', '2026-06-10 14:00:00', 3, 2),
(2, 'استكمال توقيع عقد مجموعة الراجحي الاستثمارية وتنزيل الدفعة الأولى', 'إحضار العقد المصدق من الغرفة التجارية وتسليمه لمدير الحسابات', 'urgent', 'pending', '2026-06-08 09:00:00', 2, 1),
(3, 'الاتصال بالعميل الجديد نواف العبدالله للترحيب وشرح الميزات', 'مكالمة ترحيبية قصيرة لمعرفة نوع الأعمال والخدمات المطلوبة لشركته الناشئة', 'low', 'completed', '2026-06-05 11:30:00', 3, 4);

-- 13. Notifications
INSERT INTO `notifications` (`user_id`, `title_ar`, `title_en`, `content_ar`, `content_en`, `type`) VALUES
(2, 'مهمة عاجلة مستحقة قريباً', 'Urgent task due soon', 'استكمال توقيع عقد مجموعة الراجحي الاستثمارية مستحق في 08 يونيو', 'Completing the contract of Al Rajhi group is due on June 08', 'task_alert'),
(3, 'صفقة جديدة مرشحة للتأهيل', 'New qualified lead', 'تم تصنيف العميل خليل اليافعي كعميل مؤهل من قبل نظام الفرز الإلكتروني بمعدل 85 نقطة', 'Client Khalil Al-Yafei qualified via sorting logic with score 85', 'lead_update');

-- 14. Activity Logs
INSERT INTO `activity_logs` (`user_id`, `action`, `target_type`, `target_id`, `description_ar`, `description_en`) VALUES
(1, 'login', NULL, NULL, 'تسجيل دخول ناجح لمدير النظام أحمد المدير', 'Successful login of System Admin Ahmed Al-Mudeer'),
(1, 'create', 'Client', 4, 'إضافة عميل جديد نواف العبدالله في قاعدة البيانات', 'Added new client Nawaf Al-Abdullah to database'),
(2, 'update', 'Task', 2, 'تعديل حالة مهمة عقد الراجحي وتعيين الأولوية إلى عاجلة', 'Modified contract task state to urgent');

-- Enable foreign keys back
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- END OF DATABASE SCRIPT
-- =====================================================================
