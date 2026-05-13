package com.example.erpWithLCNC.modules.inventory.repository;

import com.example.erpWithLCNC.modules.inventory.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    boolean existsBySku(String sku);

    Page<Product> findByActiveTrue(Pageable pageable);

    @Query(value = """
        SELECT DISTINCT p.*
        FROM products p
        LEFT JOIN lcnc_entity_extended_data led
            ON led.entity_id = p.id
            AND led.entity_name = 'product'
        WHERE p.is_active = true
        AND (
            :search IS NULL
            OR LOWER(p.name)                                   LIKE :search
            OR LOWER(p.sku)                                    LIKE :search
            OR LOWER(COALESCE(p.description, ''))              LIKE :search
            OR LOWER(COALESCE(led.field_value #>> '{}', ''))   LIKE :search
        )
        AND (:categoryId IS NULL OR p.category_id = CAST(:categoryId AS uuid))
        """,
        countQuery = """
        SELECT COUNT(DISTINCT p.id)
        FROM products p
        LEFT JOIN lcnc_entity_extended_data led
            ON led.entity_id = p.id
            AND led.entity_name = 'product'
        WHERE p.is_active = true
        AND (
            :search IS NULL
            OR LOWER(p.name)                                   LIKE :search
            OR LOWER(p.sku)                                    LIKE :search
            OR LOWER(COALESCE(p.description, ''))              LIKE :search
            OR LOWER(COALESCE(led.field_value #>> '{}', ''))   LIKE :search
        )
        AND (:categoryId IS NULL OR p.category_id = CAST(:categoryId AS uuid))
        """,
        nativeQuery = true)
    Page<Product> searchProducts(
            @Param("search") String search,
            @Param("categoryId") UUID categoryId,
            Pageable pageable
    );



    // Fixed: JOIN through the relationship field s.product, not ON s.product = p
    @Query("""
        SELECT p.id, p.sku, p.name,
               COALESCE(SUM(s.quantity), 0) as stock
        FROM Product p
        LEFT JOIN InventoryStock s ON s.product = p
        WHERE p.reorderPoint > 0
        GROUP BY p.id, p.sku, p.name, p.reorderPoint
        HAVING COALESCE(SUM(s.quantity), 0) <= p.reorderPoint
        """)
    List<Object[]> findLowStockProducts();
}