package com.example.erpWithLCNC.modules.inventory.mapper;

import com.example.erpWithLCNC.modules.inventory.dto.ProductRequest;
import com.example.erpWithLCNC.modules.inventory.dto.ProductResponse;
import com.example.erpWithLCNC.modules.inventory.entity.Product;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProductMapper {

    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "currentStock", ignore = true)
    ProductResponse toResponse(Product product);

    @Mapping(target = "category", ignore = true)   // set manually in service
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    Product toEntity(ProductRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    void updateEntity(ProductRequest request, @MappingTarget Product product);
}