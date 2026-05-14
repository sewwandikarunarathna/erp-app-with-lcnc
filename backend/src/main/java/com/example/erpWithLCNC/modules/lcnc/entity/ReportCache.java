package com.example.erpWithLCNC.modules.lcnc.entity;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "report_cache")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportCache {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id")
    private ReportDefinition report;

    @Column(name = "filter_hash")
    private String filterHash;

    @JdbcTypeCode(SqlTypes.JSON)
    private JsonNode result;

    @Column(name = "row_count")
    private Integer rowCount;

    @Column(name = "cached_at")
    private LocalDateTime cachedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @PrePersist
    protected void onCreate() {
        cachedAt = LocalDateTime.now();
    }
}
