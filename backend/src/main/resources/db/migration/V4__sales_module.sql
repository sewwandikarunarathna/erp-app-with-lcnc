-- V4__sales_module.sql

-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE customers (
                           id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           code         VARCHAR(50) UNIQUE NOT NULL,
                           name         VARCHAR(255) NOT NULL,
                           email        VARCHAR(255),
                           phone        VARCHAR(50),
                           address      TEXT,
                           credit_limit NUMERIC(15,2) DEFAULT 0,
                           is_active    BOOLEAN DEFAULT TRUE,
                           created_at   TIMESTAMP DEFAULT NOW(),
                           updated_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE suppliers (
                           id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           code         VARCHAR(50) UNIQUE NOT NULL,
                           name         VARCHAR(255) NOT NULL,
                           email        VARCHAR(255),
                           phone        VARCHAR(50),
                           address      TEXT,
                           payment_terms INTEGER DEFAULT 30,     -- days
                           is_active    BOOLEAN DEFAULT TRUE,
                           created_at   TIMESTAMP DEFAULT NOW(),
                           updated_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sales_orders (
                              id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              order_number   VARCHAR(50) UNIQUE NOT NULL,
                              customer_id    UUID REFERENCES customers(id),
                              order_date     DATE NOT NULL,
                              delivery_date  DATE,
                              status         VARCHAR(30) DEFAULT 'DRAFT',  -- DRAFT,CONFIRMED,SHIPPED,DELIVERED,CANCELLED
                              subtotal       NUMERIC(15,2) DEFAULT 0,
                              tax_amount     NUMERIC(15,2) DEFAULT 0,
                              total_amount   NUMERIC(15,2) DEFAULT 0,
                              notes          TEXT,
                              created_by     UUID REFERENCES users(id),
                              created_at     TIMESTAMP DEFAULT NOW(),
                              updated_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sales_order_items (
                                   id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                   order_id      UUID REFERENCES sales_orders(id) ON DELETE CASCADE,
                                   product_id    UUID REFERENCES products(id),
                                   quantity      NUMERIC(15,3) NOT NULL,
                                   unit_price    NUMERIC(15,2) NOT NULL,
                                   discount_pct  NUMERIC(5,2) DEFAULT 0,
                                   line_total    NUMERIC(15,2) NOT NULL,
                                   line_order    INTEGER NOT NULL
);

-- Indexes
CREATE INDEX idx_sales_orders_customer ON sales_orders(customer_id);
CREATE INDEX idx_sales_orders_status ON sales_orders(status);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id, created_at DESC);
CREATE INDEX idx_journal_entries_date ON journal_entries(entry_date DESC);
CREATE INDEX idx_invoices_status ON invoices(status, due_date);