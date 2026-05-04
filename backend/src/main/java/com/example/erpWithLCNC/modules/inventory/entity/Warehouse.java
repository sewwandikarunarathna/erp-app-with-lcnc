package com.example.erpWithLCNC.modules.inventory.entity;

import com.example.erpWithLCNC.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "warehouses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @SuperBuilder
public class Warehouse extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    private String location;

    @Column(name = "is_active")
    private boolean active = true;
}