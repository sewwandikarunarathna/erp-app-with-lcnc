-- V9__dashboard_lcnc.sql

-- Report definitions
CREATE TABLE report_definitions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  data_source   VARCHAR(100) NOT NULL,   -- 'orders', 'suppliers', 'form:supplier_eval'
  source_type   VARCHAR(50) DEFAULT 'ENTITY',  -- 'ENTITY' | 'FORM' | 'CUSTOM_SQL'
  columns       JSONB NOT NULL,          -- field selections, aliases, formats
  filters       JSONB,                   -- default filter conditions
  grouping      JSONB,                   -- group-by + aggregate config
  sorting       JSONB,                   -- default sort columns
  chart_config  JSONB,                   -- visualization type and field bindings
  is_shared     BOOLEAN DEFAULT FALSE,
  owner_id      UUID REFERENCES users(id),
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Dashboards
CREATE TABLE dashboards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  owner_id    UUID REFERENCES users(id),
  is_shared   BOOLEAN DEFAULT FALSE,
  is_default  BOOLEAN DEFAULT FALSE,
  layout      JSONB NOT NULL,   -- widget positions and sizes (react-grid-layout format)
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Widgets placed on dashboards
CREATE TABLE dashboard_widgets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id  UUID REFERENCES dashboards(id) ON DELETE CASCADE,
  report_id     UUID REFERENCES report_definitions(id),
  widget_type   VARCHAR(50),    -- 'BAR_CHART','LINE_CHART','KPI_CARD','TABLE','PIE'
  title         VARCHAR(255),
  config        JSONB,          -- widget-specific overrides
  position      JSONB,          -- {x, y, w, h} for grid
  refresh_secs  INTEGER DEFAULT 300
);

-- Cached query results for expensive reports
CREATE TABLE report_cache (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id     UUID REFERENCES report_definitions(id) ON DELETE CASCADE,
  filter_hash   VARCHAR(64),    -- hash of applied filters for cache keying
  result        JSONB,
  row_count     INTEGER,
  cached_at     TIMESTAMP DEFAULT NOW(),
  expires_at    TIMESTAMP,
  UNIQUE(report_id, filter_hash)
);

-- Indexing for performance
CREATE INDEX idx_report_cache_expiry ON report_cache(expires_at);
CREATE INDEX idx_dashboard_widgets ON dashboard_widgets(dashboard_id);
CREATE INDEX idx_report_definitions_owner ON report_definitions(owner_id);
CREATE INDEX idx_dashboards_owner ON dashboards(owner_id);
