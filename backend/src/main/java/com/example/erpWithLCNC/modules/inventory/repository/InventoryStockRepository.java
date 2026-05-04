// WarehouseRepository.java
package com.example.erpWithLCNC.modules.inventory.repository;

import com.example.erpWithLCNC.modules.inventory.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InventoryStockRepository extends JpaRepository<Warehouse, UUID> {
    List<Warehouse> findByActiveTrue();
    boolean existsByCode(String code);
}