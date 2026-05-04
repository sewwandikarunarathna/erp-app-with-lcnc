-- V2__finance_module.sql
-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE chart_of_accounts (
                                   id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                   code         VARCHAR(20) UNIQUE NOT NULL,
                                   name         VARCHAR(255) NOT NULL,
                                   account_type VARCHAR(50) NOT NULL,  -- ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
                                   parent_id    UUID REFERENCES chart_of_accounts(id),
                                   is_active    BOOLEAN DEFAULT TRUE,
                                   created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE journal_entries (
                                 id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                 entry_number VARCHAR(50) UNIQUE NOT NULL,
                                 entry_date   DATE NOT NULL,
                                 description  TEXT,
                                 status       VARCHAR(30) DEFAULT 'DRAFT',  -- DRAFT, POSTED, REVERSED
                                 reference    VARCHAR(100),
                                 created_by   UUID REFERENCES users(id),
                                 posted_by    UUID REFERENCES users(id),
                                 posted_at    TIMESTAMP,
                                 created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE journal_entry_lines (
                                     id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                     journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
                                     account_id       UUID REFERENCES chart_of_accounts(id),
                                     description      TEXT,
                                     debit_amount     NUMERIC(15,2) DEFAULT 0,
                                     credit_amount    NUMERIC(15,2) DEFAULT 0,
                                     line_order       INTEGER NOT NULL
);

CREATE TABLE invoices (
                          id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          invoice_number VARCHAR(50) UNIQUE NOT NULL,
                          invoice_type   VARCHAR(20) NOT NULL,    -- RECEIVABLE, PAYABLE
                          party_id       UUID,                    -- customer or supplier UUID
                          party_type     VARCHAR(20),             -- CUSTOMER, SUPPLIER
                          invoice_date   DATE NOT NULL,
                          due_date       DATE NOT NULL,
                          status         VARCHAR(30) DEFAULT 'DRAFT',
                          subtotal       NUMERIC(15,2) DEFAULT 0,
                          tax_amount     NUMERIC(15,2) DEFAULT 0,
                          total_amount   NUMERIC(15,2) DEFAULT 0,
                          paid_amount    NUMERIC(15,2) DEFAULT 0,
                          notes          TEXT,
                          created_by     UUID REFERENCES users(id),
                          created_at     TIMESTAMP DEFAULT NOW(),
                          updated_at     TIMESTAMP DEFAULT NOW()
);