-- CreateTable
CREATE TABLE `audit_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `entity_name` VARCHAR(100) NOT NULL,
    `entity_id` BIGINT UNSIGNED NOT NULL,
    `operation` ENUM('INSERT', 'UPDATE', 'DELETE', 'POST', 'REVERSE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT', 'CANCEL') NOT NULL,
    `old_data` JSON NULL,
    `new_data` JSON NULL,
    `ip_address` VARCHAR(50) NULL,
    `user_agent` VARCHAR(500) NULL,
    `session_id` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_audit_company`(`company_id`),
    INDEX `idx_audit_company_date`(`company_id`, `created_at`),
    INDEX `idx_audit_company_entity`(`company_id`, `entity_name`),
    INDEX `idx_audit_date`(`created_at`),
    INDEX `idx_audit_entity`(`entity_name`, `entity_id`),
    INDEX `idx_audit_operation`(`operation`),
    INDEX `idx_audit_user`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bank_accounts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `bank_name` VARCHAR(100) NOT NULL,
    `agency` VARCHAR(20) NULL,
    `account_number` VARCHAR(30) NULL,
    `current_balance` DECIMAL(18, 2) NULL DEFAULT 0.00,
    `active` BOOLEAN NULL DEFAULT true,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_bank_company`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cash_movements` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `bank_account_id` BIGINT UNSIGNED NULL,
    `movement_date` DATE NOT NULL,
    `type` ENUM('INCOME', 'EXPENSE') NOT NULL,
    `amount` DECIMAL(18, 2) NOT NULL,
    `description` VARCHAR(255) NULL,
    `journal_entry_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_cash_bank_account`(`bank_account_id`),
    INDEX `idx_cash_company`(`company_id`),
    INDEX `idx_cash_company_date`(`company_id`, `movement_date`),
    INDEX `idx_cash_company_type`(`company_id`, `type`),
    INDEX `idx_cash_date`(`movement_date`),
    INDEX `idx_cash_journal`(`journal_entry_id`),
    INDEX `idx_cash_type`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chart_plans` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(1000) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uk_chart_plan_code`(`code`),
    INDEX `idx_chart_plan_active`(`active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chart_account_templates` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `chart_plan_id` BIGINT UNSIGNED NOT NULL,
    `code` VARCHAR(30) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `category` ENUM('ATIVO', 'PASSIVO', 'PATRIMONIO', 'RECEITA', 'DESPESA') NOT NULL,
    `parent_id` BIGINT UNSIGNED NULL,
    `analytical` BOOLEAN NOT NULL DEFAULT true,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_template_plan`(`chart_plan_id`),
    INDEX `idx_template_parent`(`parent_id`),
    INDEX `idx_template_category`(`category`),
    UNIQUE INDEX `uk_template_plan_code`(`chart_plan_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chart_accounts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `template_id` BIGINT UNSIGNED NULL,
    `code` VARCHAR(30) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `category` ENUM('ATIVO', 'PASSIVO', 'PATRIMONIO', 'RECEITA', 'DESPESA') NOT NULL,
    `parent_id` BIGINT UNSIGNED NULL,
    `analytical` BOOLEAN NOT NULL DEFAULT true,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `chart_accounts_company_id_idx`(`company_id`),
    INDEX `chart_accounts_template_id_idx`(`template_id`),
    INDEX `chart_accounts_parent_id_idx`(`parent_id`),
    INDEX `chart_accounts_category_idx`(`category`),
    UNIQUE INDEX `uk_company_chart_account_code`(`company_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `company_accounts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `chart_account_id` BIGINT UNSIGNED NOT NULL,
    `favorite` BOOLEAN NOT NULL DEFAULT false,
    `notes` VARCHAR(1000) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uk_company_account`(`company_id`, `chart_account_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `companies` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL,
    `legal_name` VARCHAR(255) NOT NULL,
    `trade_name` VARCHAR(255) NULL,
    `tax_id` VARCHAR(20) NOT NULL,
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(30) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `chart_plan_id` BIGINT UNSIGNED NULL,
    `asaas_customer_id` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL,

    UNIQUE INDEX `uk_companies_uuid`(`uuid`),
    UNIQUE INDEX `uk_companies_tax_id`(`tax_id`),
    INDEX `companies_chart_plan_id_idx`(`chart_plan_id`),
    INDEX `idx_companies_active`(`active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `document_number` VARCHAR(20) NULL,
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(30) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_customer_company`(`company_id`),
    INDEX `idx_customer_doc`(`document_number`),
    UNIQUE INDEX `uk_customer_company_document`(`company_id`, `document_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `journal_entries` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `entry_number` VARCHAR(50) NOT NULL,
    `entry_date` DATE NOT NULL,
    `description` VARCHAR(500) NULL,
    `total_debit` DECIMAL(18, 2) NOT NULL,
    `total_credit` DECIMAL(18, 2) NOT NULL,
    `source_module` ENUM('MANUAL', 'PAYABLE', 'RECEIVABLE', 'BANK', 'PIX', 'INVOICE') NULL DEFAULT 'MANUAL',
    `status` ENUM('DRAFT', 'POSTED', 'REVERSED') NOT NULL,
    `reversal_of_entry_id` BIGINT UNSIGNED NULL,
    `reversed_by_entry_id` BIGINT UNSIGNED NULL,
    `created_by` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_journal_reversal_generated`(`reversed_by_entry_id`),
    INDEX `fk_journal_reversal_origin`(`reversal_of_entry_id`),
    INDEX `fk_journal_user`(`created_by`),
    INDEX `idx_journal_company`(`company_id`),
    INDEX `idx_journal_date`(`entry_date`),
    INDEX `idx_journal_status`(`status`),
    UNIQUE INDEX `uk_company_entry_number`(`company_id`, `entry_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `journal_entry_items` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `entry_id` BIGINT UNSIGNED NOT NULL,
    `account_id` BIGINT UNSIGNED NOT NULL,
    `type` ENUM('DEBIT', 'CREDIT') NOT NULL,
    `amount` DECIMAL(18, 2) NOT NULL,
    `description` VARCHAR(500) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_item_account`(`account_id`),
    INDEX `idx_item_entry`(`entry_id`),
    INDEX `idx_item_type`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `journal_reversals` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `original_entry_id` BIGINT UNSIGNED NOT NULL,
    `reversal_entry_id` BIGINT UNSIGNED NOT NULL,
    `reason` VARCHAR(500) NOT NULL,
    `reversed_by_user_id` BIGINT UNSIGNED NOT NULL,
    `reversed_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uk_reversal_original`(`original_entry_id`),
    UNIQUE INDEX `uk_reversal_generated`(`reversal_entry_id`),
    INDEX `idx_reverse_company`(`company_id`),
    INDEX `idx_reverse_company_date`(`company_id`, `reversed_at`),
    INDEX `idx_reverse_date`(`reversed_at`),
    INDEX `idx_reverse_user`(`reversed_by_user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ledger_movements` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `account_id` BIGINT UNSIGNED NOT NULL,
    `journal_item_id` BIGINT UNSIGNED NOT NULL,
    `movement_date` DATE NOT NULL,
    `debit` DECIMAL(18, 2) NULL DEFAULT 0.00,
    `credit` DECIMAL(18, 2) NULL DEFAULT 0.00,
    `running_balance` DECIMAL(18, 2) NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_ledger_item`(`journal_item_id`),
    INDEX `idx_ledger_account`(`account_id`),
    INDEX `idx_ledger_account_date`(`account_id`, `movement_date`),
    INDEX `idx_ledger_company`(`company_id`),
    INDEX `idx_ledger_date`(`movement_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payables` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `supplier_id` BIGINT UNSIGNED NULL,
    `issue_date` DATE NOT NULL,
    `due_date` DATE NOT NULL,
    `amount` DECIMAL(18, 2) NOT NULL,
    `paid_amount` DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    `description` VARCHAR(255) NULL,
    `status` ENUM('OPEN', 'PARTIAL', 'PAID', 'CANCELLED') NOT NULL DEFAULT 'OPEN',
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_payable_company`(`company_id`),
    INDEX `idx_payable_company_status`(`company_id`, `status`),
    INDEX `idx_payable_due_date`(`due_date`),
    INDEX `idx_payable_status`(`status`),
    INDEX `idx_payable_supplier`(`supplier_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `receivables` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `customer_id` BIGINT UNSIGNED NULL,
    `issue_date` DATE NOT NULL,
    `due_date` DATE NOT NULL,
    `amount` DECIMAL(18, 2) NOT NULL,
    `received_amount` DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    `description` VARCHAR(255) NULL,
    `status` ENUM('OPEN', 'PARTIAL', 'PAID', 'CANCELLED') NOT NULL DEFAULT 'OPEN',
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_receivable_company`(`company_id`),
    INDEX `idx_receivable_company_status`(`company_id`, `status`),
    INDEX `idx_receivable_customer`(`customer_id`),
    INDEX `idx_receivable_due_date`(`due_date`),
    INDEX `idx_receivable_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `suppliers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `document_number` VARCHAR(20) NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(30) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_supplier_company`(`company_id`),
    UNIQUE INDEX `uk_supplier_company_doc`(`company_id`, `document_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('SUPER_ADMIN', 'COMPANY_ADMIN', 'ACCOUNTANT', 'MANAGER', 'EMPLOYEE') NOT NULL DEFAULT 'EMPLOYEE',
    `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uk_user_company`(`company_id`, `id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payable_payments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `payable_id` BIGINT UNSIGNED NOT NULL,
    `payment_date` DATE NOT NULL,
    `amount` DECIMAL(18, 2) NOT NULL,
    `payment_method` ENUM('CASH', 'PIX', 'TED', 'DOC', 'BANK_TRANSFER', 'CHECK', 'CREDIT_CARD', 'DEBIT_CARD', 'OTHER') NULL,
    `document_number` VARCHAR(100) NULL,
    `notes` VARCHAR(1000) NULL,
    `journal_entry_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_payment_payable`(`payable_id`),
    INDEX `idx_payment_date`(`payment_date`),
    INDEX `idx_payment_journal`(`journal_entry_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plans` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(1000) NULL,
    `billing_period` ENUM('MONTHLY', 'YEARLY') NOT NULL,
    `price` DECIMAL(18, 2) NOT NULL,
    `trial_days` INTEGER NOT NULL DEFAULT 14,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uk_plan_code`(`code`),
    INDEX `idx_plan_active`(`active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `features` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(100) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(1000) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `category` VARCHAR(50) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uk_feature_code`(`code`),
    INDEX `idx_feature_active`(`active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plan_features` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `plan_id` BIGINT UNSIGNED NOT NULL,
    `feature_id` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_plan_feature_plan`(`plan_id`),
    INDEX `idx_plan_feature_feature`(`feature_id`),
    UNIQUE INDEX `uk_plan_feature`(`plan_id`, `feature_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plan_limits` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `plan_id` BIGINT UNSIGNED NOT NULL,
    `resource_code` VARCHAR(100) NOT NULL,
    `limit_value` INTEGER NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_plan_limit_plan`(`plan_id`),
    UNIQUE INDEX `uk_plan_limit`(`plan_id`, `resource_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscriptions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `plan_id` BIGINT UNSIGNED NOT NULL,
    `status` ENUM('TRIALING', 'ACTIVE', 'PAST_DUE', 'SUSPENDED', 'CANCELED', 'EXPIRED') NOT NULL,
    `started_at` DATE NOT NULL,
    `trial_ends_at` DATE NULL,
    `current_period_start` DATE NULL,
    `current_period_end` DATE NULL,
    `cancelled_at` DATE NULL,
    `external_customer_id` VARCHAR(255) NULL,
    `external_subscription_id` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_subscription_company`(`company_id`),
    INDEX `idx_subscription_plan`(`plan_id`),
    INDEX `idx_subscription_status`(`status`),
    UNIQUE INDEX `uk_subscription_company`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscription_history` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `subscription_id` BIGINT UNSIGNED NOT NULL,
    `old_plan_id` BIGINT UNSIGNED NULL,
    `new_plan_id` BIGINT UNSIGNED NULL,
    `notes` VARCHAR(1000) NULL,
    `changed_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_subscription_history_sub`(`subscription_id`),
    INDEX `idx_subscription_history_old_plan`(`old_plan_id`),
    INDEX `idx_subscription_history_new_plan`(`new_plan_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoices` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `subscription_id` BIGINT UNSIGNED NOT NULL,
    `invoice_number` VARCHAR(50) NOT NULL,
    `issue_date` DATE NOT NULL,
    `due_date` DATE NOT NULL,
    `amount` DECIMAL(18, 2) NOT NULL,
    `paid_at` DATETIME(0) NULL,
    `status` ENUM('PENDING', 'PAID', 'OVERDUE', 'VOIDED', 'REFUNDED') NOT NULL,
    `gateway_reference` VARCHAR(255) NULL,
    `external_invoice_id` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_invoice_company`(`company_id`),
    INDEX `idx_invoice_subscription`(`subscription_id`),
    INDEX `idx_invoice_status`(`status`),
    INDEX `idx_invoice_due_date`(`due_date`),
    INDEX `idx_invoice_company_status`(`company_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NOT NULL,
    `invoice_id` BIGINT UNSIGNED NOT NULL,
    `gateway` ENUM('STRIPE', 'PAGARME', 'MERCADO_PAGO', 'MANUAL') NOT NULL,
    `transaction_id` VARCHAR(255) NULL,
    `gateway_response` JSON NULL,
    `amount` DECIMAL(18, 2) NOT NULL,
    `paid_at` DATETIME(0) NULL,
    `status` ENUM('PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED') NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_payment_company`(`company_id`),
    INDEX `idx_payment_invoice`(`invoice_id`),
    INDEX `idx_payment_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscription_cancellations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `subscription_id` BIGINT UNSIGNED NOT NULL,
    `reason` ENUM('TOO_EXPENSIVE', 'MISSING_FEATURES', 'SWITCHED_COMPETITOR', 'BAD_SUPPORT', 'BUSINESS_CLOSED', 'OTHER') NOT NULL,
    `notes` VARCHAR(1000) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_subscription_cancel_sub`(`subscription_id`),
    INDEX `idx_subscription_cancel_reason`(`reason`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `fk_audit_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `bank_accounts` ADD CONSTRAINT `fk_bank_account_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cash_movements` ADD CONSTRAINT `fk_cash_bank` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cash_movements` ADD CONSTRAINT `fk_cash_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cash_movements` ADD CONSTRAINT `fk_cash_journal` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `chart_account_templates` ADD CONSTRAINT `fk_template_plan` FOREIGN KEY (`chart_plan_id`) REFERENCES `chart_plans`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chart_account_templates` ADD CONSTRAINT `fk_template_parent` FOREIGN KEY (`parent_id`) REFERENCES `chart_account_templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chart_accounts` ADD CONSTRAINT `fk_chart_account_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chart_accounts` ADD CONSTRAINT `fk_chart_account_template` FOREIGN KEY (`template_id`) REFERENCES `chart_account_templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chart_accounts` ADD CONSTRAINT `fk_chart_account_parent` FOREIGN KEY (`parent_id`) REFERENCES `chart_accounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `company_accounts` ADD CONSTRAINT `company_accounts_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `company_accounts` ADD CONSTRAINT `company_accounts_chart_account_id_fkey` FOREIGN KEY (`chart_account_id`) REFERENCES `chart_accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `companies` ADD CONSTRAINT `fk_company_chart_plan` FOREIGN KEY (`chart_plan_id`) REFERENCES `chart_plans`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customers` ADD CONSTRAINT `fk_customers_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `journal_entries` ADD CONSTRAINT `fk_journal_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `journal_entries` ADD CONSTRAINT `fk_journal_reversal_generated` FOREIGN KEY (`reversed_by_entry_id`) REFERENCES `journal_entries`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `journal_entries` ADD CONSTRAINT `fk_journal_reversal_origin` FOREIGN KEY (`reversal_of_entry_id`) REFERENCES `journal_entries`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `journal_entries` ADD CONSTRAINT `fk_journal_user` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `journal_entry_items` ADD CONSTRAINT `fk_item_account` FOREIGN KEY (`account_id`) REFERENCES `chart_accounts`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `journal_entry_items` ADD CONSTRAINT `fk_item_entry` FOREIGN KEY (`entry_id`) REFERENCES `journal_entries`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `journal_reversals` ADD CONSTRAINT `fk_reverse_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `journal_reversals` ADD CONSTRAINT `fk_reverse_generated` FOREIGN KEY (`reversal_entry_id`) REFERENCES `journal_entries`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `journal_reversals` ADD CONSTRAINT `fk_reverse_original` FOREIGN KEY (`original_entry_id`) REFERENCES `journal_entries`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `journal_reversals` ADD CONSTRAINT `fk_reverse_user` FOREIGN KEY (`reversed_by_user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ledger_movements` ADD CONSTRAINT `fk_ledger_account` FOREIGN KEY (`account_id`) REFERENCES `chart_accounts`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ledger_movements` ADD CONSTRAINT `fk_ledger_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ledger_movements` ADD CONSTRAINT `fk_ledger_item` FOREIGN KEY (`journal_item_id`) REFERENCES `journal_entry_items`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `payables` ADD CONSTRAINT `fk_payable_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `payables` ADD CONSTRAINT `fk_payable_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `receivables` ADD CONSTRAINT `fk_receivable_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `receivables` ADD CONSTRAINT `fk_receivable_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `suppliers` ADD CONSTRAINT `fk_suppliers_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `payable_payments` ADD CONSTRAINT `fk_payment_payable` FOREIGN KEY (`payable_id`) REFERENCES `payables`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `payable_payments` ADD CONSTRAINT `fk_payment_journal` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `plan_features` ADD CONSTRAINT `fk_plan_feature_plan` FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `plan_features` ADD CONSTRAINT `fk_plan_feature_feature` FOREIGN KEY (`feature_id`) REFERENCES `features`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `plan_limits` ADD CONSTRAINT `fk_plan_limit_plan` FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD CONSTRAINT `fk_subscription_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD CONSTRAINT `fk_subscription_plan` FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `subscription_history` ADD CONSTRAINT `fk_subscription_history_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `subscription_history` ADD CONSTRAINT `subscription_history_old_plan_id_fkey` FOREIGN KEY (`old_plan_id`) REFERENCES `plans`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscription_history` ADD CONSTRAINT `subscription_history_new_plan_id_fkey` FOREIGN KEY (`new_plan_id`) REFERENCES `plans`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `fk_invoice_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `fk_invoice_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `fk_payment_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `fk_payment_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `subscription_cancellations` ADD CONSTRAINT `fk_subscription_cancel` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

