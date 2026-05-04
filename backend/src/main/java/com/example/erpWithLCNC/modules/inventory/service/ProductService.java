package com.example.erpWithLCNC.modules.inventory.service;

import com.example.erpWithLCNC.common.exception.BusinessException;
import com.example.erpWithLCNC.common.exception.ResourceNotFoundException;
import com.example.erpWithLCNC.modules.inventory.dto.ProductRequest;
import com.example.erpWithLCNC.modules.inventory.dto.ProductResponse;
import com.example.erpWithLCNC.modules.inventory.entity.Product;
import com.example.erpWithLCNC.modules.inventory.mapper.ProductMapper;
import com.example.erpWithLCNC.modules.inventory.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.erpWithLCNC.modules.inventory.entity.Category;
import com.example.erpWithLCNC.modules.inventory.repository.CategoryRepository;

import java.util.UUID;

// modules/inventory/service/ProductService.java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;

    public Page<ProductResponse> getProducts(String search, UUID categoryId,
                                             int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).ascending());
        return productRepository.searchProducts(search, categoryId, pageable)
                .map(productMapper::toResponse);
    }

    public ProductResponse getProduct(UUID id) {
        return productRepository.findById(id)
                .map(productMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        if (productRepository.existsBySku(request.getSku()))
            throw new BusinessException("SKU already exists: " + request.getSku());

        Product product = productMapper.toEntity(request);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            product.setCategory(category);
        }

        product = productRepository.save(product);
        log.info("Product created: {} ({})", product.getName(), product.getSku());
        return productMapper.toResponse(product);
    }

    @Transactional
    public ProductResponse updateProduct(UUID id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));

        // SKU change check — only validate if SKU actually changed
        if (!product.getSku().equals(request.getSku()) &&
                productRepository.existsBySku(request.getSku()))
            throw new BusinessException("SKU already in use: " + request.getSku());

        productMapper.updateEntity(request, product);
        return productMapper.toResponse(productRepository.save(product));
    }

    @Transactional
    public void deactivateProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        product.setActive(false);
        productRepository.save(product);
    }
}
