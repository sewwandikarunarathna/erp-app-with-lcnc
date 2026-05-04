-- V3__inventory_module.sql

-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE categories (
                            id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            name        VARCHAR(255) NOT NULL,
                            parent_id   UUID REFERENCES categories(id),
                            is_active   BOOLEAN DEFAULT TRUE,
                            created_at  TIMESTAMP DEFAULT NOW(),
                            updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products (
                          id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          sku             VARCHAR(100) UNIQUE NOT NULL,
                          name            VARCHAR(255) NOT NULL,
                          description     TEXT,
                          category_id     UUID REFERENCES categories(id),
                          unit_of_measure VARCHAR(50) DEFAULT 'UNIT',
                          cost_price      NUMERIC(15,2),
                          selling_price   NUMERIC(15,2),
                          reorder_point   INTEGER DEFAULT 0,
                          is_active       BOOLEAN DEFAULT TRUE,
                          created_at      TIMESTAMP DEFAULT NOW(),
                          updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE warehouses (
                            id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            code      VARCHAR(20) UNIQUE NOT NULL,
                            name      VARCHAR(255) NOT NULL,
                            location  TEXT,
                            is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE inventory_stock (
                                 id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                 product_id   UUID REFERENCES products(id),
                                 warehouse_id UUID REFERENCES warehouses(id),
                                 quantity     NUMERIC(15,3) DEFAULT 0,
                                 reserved_qty NUMERIC(15,3) DEFAULT 0,
                                 updated_at   TIMESTAMP DEFAULT NOW(),
                                 UNIQUE(product_id, warehouse_id)
);

CREATE TABLE stock_movements (
                                 id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                 product_id     UUID REFERENCES products(id),
                                 warehouse_id   UUID REFERENCES warehouses(id),
                                 movement_type  VARCHAR(50) NOT NULL,  -- IN, OUT, TRANSFER, ADJUSTMENT
                                 quantity       NUMERIC(15,3) NOT NULL,
                                 reference_type VARCHAR(50),           -- PURCHASE_ORDER, SALES_ORDER, ADJUSTMENT
                                 reference_id   UUID,
                                 notes          TEXT,
                                 created_by     UUID REFERENCES users(id),
                                 created_at     TIMESTAMP DEFAULT NOW()
);