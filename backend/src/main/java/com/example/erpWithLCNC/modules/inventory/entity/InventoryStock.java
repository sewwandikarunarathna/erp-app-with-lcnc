package com.example.erpWithLCNC.modules.inventory.entity;

import com.example.erpWithLCNC.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Table(name = "inventory_stock",
        uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "warehouse_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @SuperBuilder
public class InventoryStock extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @Column(precision = 15, scale = 3)
    private BigDecimal quantity = BigDecimal.ZERO;

    @Column(name = "reserved_qty", precision = 15, scale = 3)
    private BigDecimal reservedQty = BigDecimal.ZERO;
}