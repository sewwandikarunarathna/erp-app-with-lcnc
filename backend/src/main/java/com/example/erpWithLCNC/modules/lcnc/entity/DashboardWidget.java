package com.example.erpWithLCNC.modules.lcnc.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.UUID;

@Entity
@Table(name = "dashboard_widgets")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardWidget {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dashboard_id")
    @JsonBackReference
    private Dashboard dashboard;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id")
    private ReportDefinition report;

    @Column(name = "widget_type")
    private String widgetType; // BAR_CHART, LINE_CHART, KPI_CARD, TABLE, PIE

    private String title;

    @JdbcTypeCode(SqlTypes.JSON)
    private Object config;

    @JdbcTypeCode(SqlTypes.JSON)
    private Object position;

    @Column(name = "refresh_secs")
    private Integer refreshSecs;
}
