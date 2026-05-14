package com.example.erpWithLCNC.modules.lcnc.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;

@Entity
@Table(name = "dashboards")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Dashboard {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(name = "owner_id")
    private UUID ownerId;

    @Column(name = "is_shared")
    private Boolean shared = false;

    @Column(name = "is_default")
    private Boolean isDefault = false;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false)
    private Object layout;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "dashboard", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<DashboardWidget> widgets;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
