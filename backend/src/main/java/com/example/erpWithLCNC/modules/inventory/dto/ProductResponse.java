package com.example.erpWithLCNC.modules.inventory.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

// modules/inventory/dto/ProductResponse.java
@Getter @Setter
@Builder
public class ProductResponse {
    private UUID id;
    private String sku;
    private String name;
    private String description;
    private String categoryName;
    private UUID categoryId;
    private String unitOfMeasure;
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private Integer reorderPoint;
    private boolean active;
    private LocalDateTime createdAt;

    // current stock (joined via query, not a relation)
    private BigDecimal currentStock;

    private java.util.Map<String, Object> customFields;
}
