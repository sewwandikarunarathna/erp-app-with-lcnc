package com.example.erpWithLCNC.modules.lcnc.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "lcnc_forms")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LcncForm {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "form_key", unique = true, nullable = false)
    private String formKey;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "form_type")
    private String formType; // 'SYSTEM', 'CUSTOM'

    @Column(name = "is_active")
    private boolean active = true;

    @OneToMany(mappedBy = "form", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LcncFormField> fields;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
