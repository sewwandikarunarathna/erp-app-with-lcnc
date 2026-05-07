package com.example.erpWithLCNC.modules.lcnc.repository;

import com.example.erpWithLCNC.modules.lcnc.entity.LcncEntityExtendedData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface LcncEntityExtendedDataRepository extends JpaRepository<LcncEntityExtendedData, UUID> {
    List<LcncEntityExtendedData> findByEntityNameAndEntityId(String entityName, UUID entityId);
}
