package com.example.erpWithLCNC.modules.lcnc.repository;

import com.example.erpWithLCNC.modules.lcnc.entity.ReportDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;

@Repository
public interface ReportDefinitionRepository extends JpaRepository<ReportDefinition, UUID> {
    List<ReportDefinition> findByOwnerIdOrSharedTrue(UUID ownerId);
}
