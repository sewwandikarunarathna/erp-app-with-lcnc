package com.example.erpWithLCNC.modules.inventory.entity;

import com.example.erpWithLCNC.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

// modules/inventory/entity/Product.java
@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Product extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String sku;

    @Column(nullable = false)
    private String name;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "unit_of_measure")
    private String unitOfMeasure = "UNIT";

    @Column(precision = 15, scale = 2)
    private BigDecimal costPrice;

    @Column(precision = 15, scale = 2)
    private BigDecimal sellingPrice;

    @Column(name = "reorder_point")
    private Integer reorderPoint = 0;

    @Column(name = "is_active")
    private boolean active = true;
}
