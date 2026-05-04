package com.example.erpWithLCNC.modules.auth.entity;

import com.example.erpWithLCNC.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "roles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @SuperBuilder
public class Role extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    private String description;
}