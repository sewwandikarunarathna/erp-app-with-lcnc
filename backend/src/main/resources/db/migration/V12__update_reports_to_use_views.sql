-- V12__update_reports_to_use_views.sql

-- Update Inventory Status report to use the new view and correct columns
UPDATE report_definitions 
SET 
    data_source = 'v_product_stock',
    columns = '[{"field": "product_name", "alias": "Product"}, {"field": "total_quantity", "alias": "Quantity"}]'::jsonb
WHERE name = 'Inventory Status';

-- Update Total Sales Overview report to use the sales view
UPDATE report_definitions 
SET 
    data_source = 'v_sales_overview',
    columns = '[{"field": "order_number", "alias": "Order"}, {"field": "total_amount", "aggregate": "SUM", "alias": "Revenue"}]'::jsonb
WHERE name = 'Total Sales Overview';
