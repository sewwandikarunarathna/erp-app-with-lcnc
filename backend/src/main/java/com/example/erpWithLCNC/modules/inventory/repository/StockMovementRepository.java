// StockMovementRepository.java
package com.example.erpWithLCNC.modules.inventory.repository;

import com.example.erpWithLCNC.modules.inventory.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, UUID> {
    List<StockMovement> findByProductIdOrderByCreatedAtDesc(UUID productId);
}