package com.example.erpWithLCNC.modules.lcnc.entity;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.UUID;

@Entity
@Table(name = "lcnc_form_fields")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LcncFormField {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private LcncForm form;

    @Column(name = "field_key", nullable = false)
    private String fieldKey;

    @Column(nullable = false)
    private String label;

    @Column(name = "field_type", nullable = false)
    private String fieldType;

    private String placeholder;

    @Column(name = "default_value")
    private String defaultValue;

    @Column(name = "is_required")
    private Boolean required;

    @Column(name = "sort_order")
    private int sortOrder;

    @JdbcTypeCode(SqlTypes.JSON)
    private Object validation;

    @JdbcTypeCode(SqlTypes.JSON)
    private Object options;

    @JdbcTypeCode(SqlTypes.JSON)
    private Object metadata;
}
