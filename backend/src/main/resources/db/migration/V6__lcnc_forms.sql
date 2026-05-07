-- LCNC Form Registry
CREATE TABLE lcnc_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_key VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    form_type VARCHAR(50) DEFAULT 'CUSTOM', -- 'SYSTEM' | 'CUSTOM'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Field Definitions
CREATE TABLE lcnc_form_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES lcnc_forms(id) ON DELETE CASCADE,
    field_key VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) NOT NULL, -- 'TEXT', 'NUMBER', 'DATE', 'SELECT', 'CHECKBOX'
    placeholder VARCHAR(255),
    default_value TEXT,
    is_required BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    validation JSONB, -- {"min": 0, "max": 100, "pattern": "..."}
    options JSONB, -- For SELECT types: [{"label": "A", "value": "a"}]
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(form_id, field_key)
);

-- Extended Data for System Entities (Scenario 2)
CREATE TABLE lcnc_entity_extended_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_name VARCHAR(100) NOT NULL, -- e.g., 'product'
    entity_id UUID NOT NULL,
    field_key VARCHAR(100) NOT NULL,
    field_value JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(entity_name, entity_id, field_key)
);

-- Seed Initial System Form for Product
INSERT INTO lcnc_forms (form_key, name, description, form_type)
VALUES ('product', 'Product Form', 'Extension fields for the core Product entity', 'SYSTEM');
