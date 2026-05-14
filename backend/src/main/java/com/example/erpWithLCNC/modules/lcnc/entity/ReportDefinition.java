package com.example.erpWithLCNC.modules.lcnc.entity;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "report_definitions")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportDefinition {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "data_source", nullable = false)
    private String dataSource;

    @Column(name = "source_type")
    private String sourceType; // ENTITY | FORM | CUSTOM_SQL

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false)
    private Object columns;

    @JdbcTypeCode(SqlTypes.JSON)
    private Object filters;

    @JdbcTypeCode(SqlTypes.JSON)
    private Object grouping;

    @JdbcTypeCode(SqlTypes.JSON)
    private Object sorting;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "chart_config")
    private Object chartConfig;

    @Column(name = "is_shared")
    private boolean shared;

    @Column(name = "owner_id")
    private UUID ownerId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (sourceType == null) sourceType = "ENTITY";
    }
}
