-- V11__add_dashboard_views.sql

-- Create a view for Inventory Status that combines product names with their total stock
CREATE OR REPLACE VIEW v_product_stock AS
SELECT 
    p.id as product_id,
    p.name as product_name,
    p.sku as product_sku,
    COALESCE(SUM(i.quantity), 0) as total_quantity
FROM products p
LEFT JOIN inventory_stock i ON p.id = i.product_id
GROUP BY p.id, p.name, p.sku;

-- Create a view for Sales Overview that summarizes orders
CREATE OR REPLACE VIEW v_sales_overview AS
SELECT 
    o.id as order_id,
    o.order_number,
    o.status,
    o.total_amount,
    o.created_at as order_date,
    c.name as customer_name
FROM sales_orders o
LEFT JOIN customers c ON o.customer_id = c.id;
