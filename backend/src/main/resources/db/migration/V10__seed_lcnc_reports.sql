-- V10__seed_lcnc_reports.sql

-- Seed some standard report definitions for all users to use
INSERT INTO report_definitions (id, name, description, data_source, source_type, columns, is_shared)
VALUES 
(
  gen_random_uuid(), 
  'Total Sales Overview', 
  'Summary of all orders and their total amounts', 
  'orders', 
  'ENTITY', 
  '[{"field": "id", "aggregate": "COUNT", "alias": "Total Orders"}, {"field": "total_amount", "aggregate": "SUM", "alias": "Revenue"}]'::jsonb,
  TRUE
),
(
  gen_random_uuid(), 
  'Inventory Status', 
  'Current stock levels across all products', 
  'products', 
  'ENTITY', 
  '[{"field": "name", "alias": "Product"}, {"field": "stock_quantity", "alias": "Quantity"}]'::jsonb,
  TRUE
),
(
  gen_random_uuid(), 
  'Supplier Reliability', 
  'Performance metrics for active suppliers', 
  'suppliers', 
  'ENTITY', 
  '[{"field": "name", "alias": "Supplier"}, {"field": "rating", "alias": "Rating"}]'::jsonb,
  TRUE
);
