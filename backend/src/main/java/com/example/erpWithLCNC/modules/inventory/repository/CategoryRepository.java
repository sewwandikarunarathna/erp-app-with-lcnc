package com.example.erpWithLCNC.modules.inventory.repository;

import com.example.erpWithLCNC.modules.inventory.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    List<Category> findByActiveTrue();

    boolean existsByName(String name);
}