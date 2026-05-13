package com.example.erpWithLCNC.modules.lcnc.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "lcnc_form_submissions")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LcncFormSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private LcncForm form;

    /** Stores the submitted field values as a JSON blob */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "data", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> data;

    /** Optional reference to a related external entity (e.g. an order ID) */
    @Column(name = "reference")
    private String reference;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
    }
}
