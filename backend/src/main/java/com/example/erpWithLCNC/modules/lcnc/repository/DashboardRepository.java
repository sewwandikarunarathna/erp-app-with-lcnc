package com.example.erpWithLCNC.modules.lcnc.repository;

import com.example.erpWithLCNC.modules.lcnc.entity.Dashboard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;
import java.util.Optional;

@Repository
public interface DashboardRepository extends JpaRepository<Dashboard, UUID> {
    List<Dashboard> findByOwnerIdOrSharedTrue(UUID ownerId);
    Optional<Dashboard> findByOwnerIdAndIsDefaultTrue(UUID ownerId);
}
