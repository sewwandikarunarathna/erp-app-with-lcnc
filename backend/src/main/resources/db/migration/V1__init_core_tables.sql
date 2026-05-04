-- V1__init_core_tables.sql

-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Shared audit columns handled via JPA @MappedSuperclass
-- Users & Roles
CREATE TABLE roles (
                       id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       name        VARCHAR(50) UNIQUE NOT NULL,   -- ADMIN, FINANCE, INVENTORY, SALES
                       description TEXT,
                       created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
                       id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       email         VARCHAR(255) UNIQUE NOT NULL,
                       password_hash VARCHAR(255) NOT NULL,
                       full_name     VARCHAR(255) NOT NULL,
                       is_active     BOOLEAN DEFAULT TRUE,
                       created_at    TIMESTAMP DEFAULT NOW(),
                       updated_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_roles (
                            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                            role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
                            PRIMARY KEY (user_id, role_id)
);