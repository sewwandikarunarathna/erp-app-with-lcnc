-- V5__seed_data.sql

-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Roles
INSERT INTO roles (id, name, description, created_at) VALUES
                                                          (gen_random_uuid(), 'ADMIN',     'Full system access',              NOW()),
                                                          (gen_random_uuid(), 'FINANCE',   'Finance module access',           NOW()),
                                                          (gen_random_uuid(), 'INVENTORY', 'Inventory module access',         NOW()),
                                                          (gen_random_uuid(), 'SALES',     'Sales module access',             NOW()),
                                                          (gen_random_uuid(), 'VIEWER',    'Read-only access across modules', NOW());

-- Admin user (password: Admin@1234)
-- BCrypt hash of 'Admin@1234'
INSERT INTO users (id, email, password_hash, full_name, is_active, created_at, updated_at) VALUES
    (gen_random_uuid(), 'admin@erp.com',
     '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
     'System Administrator', TRUE, NOW(), NOW());

-- Assign ADMIN role to admin user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'admin@erp.com'
  AND r.name = 'ADMIN';

-- Finance user (password: Finance@1234)
INSERT INTO users (id, email, password_hash, full_name, is_active, created_at, updated_at) VALUES
    (gen_random_uuid(), 'finance@erp.com',
     '$2a$12$4zRSaHHhDoCHcuXly4MYh.8sHtHWvnL3TtAUMHREBdGDFPRWOVrKa',
     'Finance Manager', TRUE, NOW(), NOW());

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.email = 'finance@erp.com' AND r.name = 'FINANCE';

-- Inventory user (password: Inventory@1234)
INSERT INTO users (id, email, password_hash, full_name, is_active, created_at, updated_at) VALUES
    (gen_random_uuid(), 'inventory@erp.com',
     '$2a$12$I3DYwp.U5MSgidM4OKPkpudBwXzAEJTbgChVV5ZBbsj0FBpFmqaHe',
     'Inventory Manager', TRUE, NOW(), NOW());

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.email = 'inventory@erp.com' AND r.name = 'INVENTORY';

-- Sales user (password: Sales@1234)
INSERT INTO users (id, email, password_hash, full_name, is_active, created_at, updated_at) VALUES
    (gen_random_uuid(), 'sales@erp.com',
     '$2a$12$njmJk7VkHFAEm.kBFCa3pOrRrMn4EB5JoFJJcTBd/MuFBJ7jDXtZS',
     'Sales Manager', TRUE, NOW(), NOW());

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.email = 'sales@erp.com' AND r.name = 'SALES';

-- Sample categories
INSERT INTO categories (id, name, parent_id, is_active, created_at) VALUES
                                                                        (gen_random_uuid(), 'Electronics',  NULL, TRUE, NOW()),
                                                                        (gen_random_uuid(), 'Office Supplies', NULL, TRUE, NOW()),
                                                                        (gen_random_uuid(), 'Raw Materials',   NULL, TRUE, NOW());

-- Sample warehouses
INSERT INTO warehouses (id, code, name, location, is_active, created_at) VALUES
                                                                             (gen_random_uuid(), 'WH-001', 'Main Warehouse',  'Colombo, Sri Lanka', TRUE, NOW()),
                                                                             (gen_random_uuid(), 'WH-002', 'North Warehouse', 'Kandy, Sri Lanka',   TRUE, NOW());

-- Sample products
INSERT INTO products (id, sku, name, description, category_id, unit_of_measure,
                      cost_price, selling_price, reorder_point, is_active, created_at, updated_at)
SELECT
    gen_random_uuid(), 'PRD-001', 'Laptop 15"',
    'High performance business laptop', c.id, 'UNIT',
    850.00, 1200.00, 5, TRUE, NOW(), NOW()
FROM categories c WHERE c.name = 'Electronics';

INSERT INTO products (id, sku, name, description, category_id, unit_of_measure,
                      cost_price, selling_price, reorder_point, is_active, created_at, updated_at)
SELECT
    gen_random_uuid(), 'PRD-002', 'Wireless Mouse',
    'Ergonomic wireless mouse', c.id, 'UNIT',
    15.00, 35.00, 20, TRUE, NOW(), NOW()
FROM categories c WHERE c.name = 'Electronics';

INSERT INTO products (id, sku, name, description, category_id, unit_of_measure,
                      cost_price, selling_price, reorder_point, is_active, created_at, updated_at)
SELECT
    gen_random_uuid(), 'PRD-003', 'A4 Paper Ream',
    '500 sheets A4 paper', c.id, 'REAM',
    3.50, 8.00, 50, TRUE, NOW(), NOW()
FROM categories c WHERE c.name = 'Office Supplies';

-- Initial stock
INSERT INTO inventory_stock (id, product_id, warehouse_id, quantity, reserved_qty, updated_at)
SELECT gen_random_uuid(), p.id, w.id, 50, 0, NOW()
FROM products p, warehouses w
WHERE p.sku = 'PRD-001' AND w.code = 'WH-001';

INSERT INTO inventory_stock (id, product_id, warehouse_id, quantity, reserved_qty, updated_at)
SELECT gen_random_uuid(), p.id, w.id, 200, 0, NOW()
FROM products p, warehouses w
WHERE p.sku = 'PRD-002' AND w.code = 'WH-001';

INSERT INTO inventory_stock (id, product_id, warehouse_id, quantity, reserved_qty, updated_at)
SELECT gen_random_uuid(), p.id, w.id, 100, 0, NOW()
FROM products p, warehouses w
WHERE p.sku = 'PRD-003' AND w.code = 'WH-001';

-- Sample customers
INSERT INTO customers (id, code, name, email, phone, address,
                       credit_limit, is_active, created_at, updated_at) VALUES
                                                                            (gen_random_uuid(), 'CUST-001', 'Acme Corporation',
                                                                             'accounts@acme.com', '+94112345678',
                                                                             '123 Main St, Colombo 01', 50000.00, TRUE, NOW(), NOW()),
                                                                            (gen_random_uuid(), 'CUST-002', 'Global Tech Ltd',
                                                                             'finance@globaltech.com', '+94119876543',
                                                                             '456 Tech Park, Colombo 03', 75000.00, TRUE, NOW(), NOW());

-- Sample suppliers
INSERT INTO suppliers (id, code, name, email, phone, address,
                       payment_terms, is_active, created_at, updated_at) VALUES
                                                                             (gen_random_uuid(), 'SUP-001', 'Tech Distributors Inc',
                                                                              'orders@techdist.com', '+94117654321',
                                                                              '789 Industrial Zone, Colombo 15', 30, TRUE, NOW(), NOW()),
                                                                             (gen_random_uuid(), 'SUP-002', 'Office World Supplies',
                                                                              'sales@officeworld.com', '+94111234567',
                                                                              '321 Business Park, Colombo 10', 45, TRUE, NOW(), NOW());

-- Chart of accounts
INSERT INTO chart_of_accounts (id, code, name, account_type, parent_id, is_active, created_at) VALUES
                                                                                                   (gen_random_uuid(), '1000', 'Assets',              'ASSET',     NULL, TRUE, NOW()),
                                                                                                   (gen_random_uuid(), '2000', 'Liabilities',         'LIABILITY', NULL, TRUE, NOW()),
                                                                                                   (gen_random_uuid(), '3000', 'Equity',              'EQUITY',    NULL, TRUE, NOW()),
                                                                                                   (gen_random_uuid(), '4000', 'Revenue',             'REVENUE',   NULL, TRUE, NOW()),
                                                                                                   (gen_random_uuid(), '5000', 'Expenses',            'EXPENSE',   NULL, TRUE, NOW());

INSERT INTO chart_of_accounts (id, code, name, account_type, parent_id, is_active, created_at)
SELECT gen_random_uuid(), '1100', 'Cash and Cash Equivalents',
       'ASSET', id, TRUE, NOW()
FROM chart_of_accounts WHERE code = '1000';

INSERT INTO chart_of_accounts (id, code, name, account_type, parent_id, is_active, created_at)
SELECT gen_random_uuid(), '1200', 'Accounts Receivable',
       'ASSET', id, TRUE, NOW()
FROM chart_of_accounts WHERE code = '1000';

INSERT INTO chart_of_accounts (id, code, name, account_type, parent_id, is_active, created_at)
SELECT gen_random_uuid(), '1300', 'Inventory',
       'ASSET', id, TRUE, NOW()
FROM chart_of_accounts WHERE code = '1000';

INSERT INTO chart_of_accounts (id, code, name, account_type, parent_id, is_active, created_at)
SELECT gen_random_uuid(), '2100', 'Accounts Payable',
       'LIABILITY', id, TRUE, NOW()
FROM chart_of_accounts WHERE code = '2000';

INSERT INTO chart_of_accounts (id, code, name, account_type, parent_id, is_active, created_at)
SELECT gen_random_uuid(), '4100', 'Sales Revenue',
       'REVENUE', id, TRUE, NOW()
FROM chart_of_accounts WHERE code = '4000';

INSERT INTO chart_of_accounts (id, code, name, account_type, parent_id, is_active, created_at)
SELECT gen_random_uuid(), '5100', 'Cost of Goods Sold',
       'EXPENSE', id, TRUE, NOW()
FROM chart_of_accounts WHERE code = '5000';

INSERT INTO chart_of_accounts (id, code, name, account_type, parent_id, is_active, created_at)
SELECT gen_random_uuid(), '5200', 'Operating Expenses',
       'EXPENSE', id, TRUE, NOW()
FROM chart_of_accounts WHERE code = '5000';