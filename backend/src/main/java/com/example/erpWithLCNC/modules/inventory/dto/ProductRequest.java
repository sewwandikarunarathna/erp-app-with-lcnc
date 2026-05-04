package com.example.erpWithLCNC.modules.inventory.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.antlr.v4.runtime.misc.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

// modules/inventory/dto/ProductRequest.java
@Getter
@Setter
public class ProductRequest {

    @NotBlank(message = "SKU is required")
    @Size(max = 100)
    private String sku;

    @NotBlank(message = "Product name is required")
    private String name;

    private String description;
    private UUID categoryId;
    private String unitOfMeasure;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal costPrice;

    @NotNull @DecimalMin("0.00")
    private BigDecimal sellingPrice;

    private Integer reorderPoint;
}

