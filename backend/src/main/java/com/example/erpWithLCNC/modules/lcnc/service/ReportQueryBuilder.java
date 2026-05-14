package com.example.erpWithLCNC.modules.lcnc.service;

import com.example.erpWithLCNC.modules.lcnc.entity.ReportDefinition;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportQueryBuilder {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public String buildQuery(ReportDefinition report) {
        // Convert Object fields to JsonNode for parsing
        JsonNode columns = objectMapper.valueToTree(report.getColumns());
        JsonNode filters = objectMapper.valueToTree(report.getFilters());
        JsonNode grouping = objectMapper.valueToTree(report.getGrouping());
        JsonNode sorting = objectMapper.valueToTree(report.getSorting());
        
        StringBuilder sql = new StringBuilder("SELECT ");
        sql.append(buildSelectClause(columns));

        // 2. FROM clause
        String tableName = resolveTableName(report);
        sql.append(" FROM ").append(tableName).append(" t");

        // 3. WHERE clause
        List<String> conditions = new ArrayList<>();
        if (filters != null && filters.isArray()) {
            for (JsonNode filter : filters) {
                String field = filter.get("field").asText();
                String op = filter.get("op").asText();
                String value = filter.get("value").asText();
                conditions.add("t." + field + " " + toSqlOperator(op) + " '" + value + "'");
            }
        }

        if (!conditions.isEmpty()) {
            sql.append(" WHERE ").append(String.join(" AND ", conditions));
        }

        // 4. GROUP BY
        if (grouping != null && grouping.has("fields")) {
            String groups = grouping.get("fields").findValuesAsText("field").stream()
                    .collect(Collectors.joining(", "));
            if (!groups.isEmpty()) {
                sql.append(" GROUP BY ").append(groups);
            }
        }

        return sql.toString();
    }

    public List<Map<String, Object>> execute(ReportDefinition report, Map<String, Object> runtimeFilters) {
        JsonNode columns = objectMapper.valueToTree(report.getColumns());
        JsonNode filters = objectMapper.valueToTree(report.getFilters());
        JsonNode grouping = objectMapper.valueToTree(report.getGrouping());
        JsonNode sorting = objectMapper.valueToTree(report.getSorting());

        StringBuilder sql = new StringBuilder();
        List<Object> params = new ArrayList<>();

        // 1. SELECT clause
        sql.append("SELECT ");
        sql.append(buildSelectClause(columns));

        // 2. FROM clause
        String tableName = resolveTableName(report);
        sql.append(" FROM ").append(tableName).append(" t");

        // 3. WHERE clause
        List<String> conditions = new ArrayList<>();
        
        // Default filters from definition
        if (filters != null && filters.isArray()) {
            for (JsonNode filter : filters) {
                String field = filter.get("field").asText();
                String op = filter.get("op").asText();
                String value = filter.get("value").asText();
                conditions.add("t." + field + " " + toSqlOperator(op) + " ?");
                params.add(value);
            }
        }

        // Runtime filters from UI
        if (runtimeFilters != null) {
            for (Map.Entry<String, Object> entry : runtimeFilters.entrySet()) {
                conditions.add("t." + entry.getKey() + " = ?");
                params.add(entry.getValue());
            }
        }

        if (!conditions.isEmpty()) {
            sql.append(" WHERE ").append(String.join(" AND ", conditions));
        }

        // 4. GROUP BY
        if (grouping != null && grouping.has("fields")) {
            String groups = grouping.get("fields").findValuesAsText("field").stream()
                    .collect(Collectors.joining(", "));
            if (!groups.isEmpty()) {
                sql.append(" GROUP BY ").append(groups);
            }
        }

        // 5. ORDER BY
        if (sorting != null && sorting.isArray()) {
            List<String> sorts = new ArrayList<>();
            for (JsonNode sort : sorting) {
                sorts.add(sort.get("field").asText() + " " + sort.get("direction").asText("ASC"));
            }
            if (!sorts.isEmpty()) {
                sql.append(" ORDER BY ").append(String.join(", ", sorts));
            }
        }

        // 6. Limit
        sql.append(" LIMIT 1000"); // Safety limit

        return jdbcTemplate.queryForList(sql.toString(), params.toArray());
    }

    private String buildSelectClause(JsonNode columns) {
        if (columns == null || !columns.isArray() || columns.isEmpty()) {
            return "*";
        }
        List<String> cols = new ArrayList<>();
        for (JsonNode col : columns) {
            String field = col.get("field").asText();
            String alias = col.has("alias") ? col.get("alias").asText() : null;
            String agg = col.has("aggregate") ? col.get("aggregate").asText() : null;

            if (agg != null) {
                cols.add(agg + "(t." + field + ")" + (alias != null ? " AS " + alias : ""));
            } else {
                cols.add("t." + field + (alias != null ? " AS " + alias : ""));
            }
        }
        return String.join(", ", cols);
    }

    private String resolveTableName(ReportDefinition report) {
        String source = report.getDataSource();
        return source;
    }

    private String toSqlOperator(String op) {
        return switch (op.toUpperCase()) {
            case "EQ" -> "=";
            case "NEQ" -> "!=";
            case "GT" -> ">";
            case "GTE" -> ">=";
            case "LT" -> "<";
            case "LTE" -> "<=";
            case "LIKE" -> "LIKE";
            case "ILIKE" -> "ILIKE";
            default -> "=";
        };
    }
}
