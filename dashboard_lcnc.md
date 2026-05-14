## Report & Dashboard Designer

---

### Core Data Model (PostgreSQL)

```sql
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
  owner_id      UUID,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Dashboard layouts
CREATE TABLE dashboards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  owner_id    UUID,
  is_shared   BOOLEAN DEFAULT FALSE,
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
  report_id     UUID REFERENCES report_definitions(id),
  filter_hash   VARCHAR(64),    -- hash of applied filters for cache keying
  result        JSONB,
  row_count     INTEGER,
  cached_at     TIMESTAMP DEFAULT NOW(),
  expires_at    TIMESTAMP,
  UNIQUE(report_id, filter_hash)
);

CREATE INDEX idx_report_cache_expiry ON report_cache(expires_at);
CREATE INDEX idx_dashboard_widgets ON dashboard_widgets(dashboard_id);
```

---

### Spring Boot — Dynamic Query Builder

This is the most critical piece. It builds safe, parameterized SQL from a report definition — no raw SQL injection risk.

```java
// ReportQueryBuilder.java
@Component
public class ReportQueryBuilder {

    public QueryResult execute(ReportDefinition report, Map<String, Object> filters,
                               int page, int size) {
        StringBuilder sql = new StringBuilder();
        List<Object> params = new ArrayList<>();

        // 1. SELECT clause — only requested columns
        String columns = buildSelectClause(report.getColumns());
        sql.append("SELECT ").append(columns);

        // 2. FROM clause — resolve data source
        String table = resolveDataSource(report);
        sql.append(" FROM ").append(table);

        // 3. JOIN extended fields if needed
        if (hasExtendedFields(report)) {
            sql.append("""
                LEFT JOIN entity_extended_data eed
                ON eed.entity_id = t.id
                AND eed.entity_name = ?
            """);
            params.add(report.getDataSource());
        }

        // 4. WHERE clause — merge default + runtime filters
        buildWhereClause(report.getFilters(), filters, sql, params);

        // 5. GROUP BY + aggregates
        if (report.getGrouping() != null)
            sql.append(buildGroupByClause(report.getGrouping()));

        // 6. ORDER BY
        if (report.getSorting() != null)
            sql.append(buildOrderByClause(report.getSorting()));

        // 7. Pagination
        sql.append(" LIMIT ? OFFSET ?");
        params.add(size);
        params.add(page * size);

        return jdbcTemplate.query(sql.toString(), resultExtractor, params.toArray());
    }

    private void buildWhereClause(JsonNode defaultFilters,
                                   Map<String, Object> runtimeFilters,
                                   StringBuilder sql, List<Object> params) {
        List<String> conditions = new ArrayList<>();

        // Apply default filters from report definition
        if (defaultFilters != null) {
            defaultFilters.forEach(f -> {
                conditions.add(f.get("field").asText() + " " +
                               toSqlOperator(f.get("op").asText()) + " ?");
                params.add(f.get("value").asText());
            });
        }

        // Apply runtime filters (from UI filter bar)
        runtimeFilters.forEach((field, value) -> {
            if (isAllowedColumn(field)) {  // whitelist check — critical for security
                conditions.add("t." + field + " = ?");
                params.add(value);
            }
        });

        if (!conditions.isEmpty())
            sql.append(" WHERE ").append(String.join(" AND ", conditions));
    }
}
```

---

### React.js — Dashboard & Report UI

**Component Architecture**

```
<DashboardPage>
  ├── <DashboardToolbar />         ← Add Widget, Edit Layout, Share buttons
  ├── <GridLayout>                 ← react-grid-layout, drag to rearrange
  │     └── <DashboardWidget />   ← each widget, shows chart or table
  │           ├── <BarChart />     ← recharts
  │           ├── <LineChart />
  │           ├── <KpiCard />
  │           └── <DataTable />
  └── <AddWidgetDrawer />          ← pick a report, choose widget type
```

**Widget data fetching with auto-refresh**

```jsx
// DashboardWidget.jsx
function DashboardWidget({ widget }) {
  const [filters, setFilters] = useState({});

  const { data, isLoading } = useQuery(
    ['report', widget.reportId, filters],
    () => api.post(`/api/reports/${widget.reportId}/run`, { filters }),
    {
      refetchInterval: widget.refreshSecs * 1000,
      staleTime: (widget.refreshSecs - 10) * 1000
    }
  );

  if (isLoading) return <WidgetSkeleton />;

  switch (widget.widgetType) {
    case 'BAR_CHART':  return <BarChartWidget data={data} config={widget.config} />;
    case 'LINE_CHART': return <LineChartWidget data={data} config={widget.config} />;
    case 'KPI_CARD':   return <KpiCard data={data} config={widget.config} />;
    case 'TABLE':      return <DataTableWidget data={data} config={widget.config} />;
    case 'PIE':        return <PieChartWidget data={data} config={widget.config} />;
    default:           return null;
  }
}
```

---

### Technology Stack Summary

| Concern | Technology | Why |
|---|---|---|
| Schema storage | PostgreSQL JSONB | Flexible, indexable, no schema migration per form |
| Extension data | `entity_extended_data` sidecar table | Add fields to system forms without touching core tables |
| Versioning | `form_versions` snapshot table | Full rollback, audit trail |
| Backend API | Spring Boot + Spring Data JPA | Clean layered service, transaction management |
| Validation | SpEL expressions + custom FieldValidator | Rule-driven, not hard-coded |
| Dynamic SQL | JdbcTemplate (not JPA) | Full control over query construction; safer for dynamic queries |
| Caching | Caffeine (in-process) + `report_cache` table | Fast schema reads, expensive report result caching |
| Security | Spring Security method-level `@PreAuthorize` | Per-endpoint permission enforcement |
| Drag-and-drop | `@dnd-kit/core` | Lightweight, accessible, works well in React |
| Form state | `react-hook-form` + `zod` | Performant, schema-driven validation |
| Charts | `recharts` | Composable, works natively with React |
| Dashboard grid | `react-grid-layout` | Persistent, resizable, drag-and-drop widget layout |
| Data fetching | `@tanstack/react-query` | Caching, background refresh, loading states built-in |

---

## Critical Design Decisions

**1. Never use JPA dynamic queries for reports** — use `JdbcTemplate` with a whitelist-validated column registry. JPA's dynamic query support is not built for this pattern and leads to either N+1 issues or unsafe string concatenation.

**4. Form schema changes create a new version** — never mutate a live schema in place. The form canvas always loads `version = latest`, but submitted data is always linked to the version active at submission time.

**5. Extended field values use JSONB not VARCHAR** — storing `1500.00` as a JSONB number (not a string) means you can aggregate, filter, and sort extended fields in reports without casting.