package com.example.erpWithLCNC.modules.lcnc.repository;

import com.example.erpWithLCNC.modules.lcnc.entity.LcncFormField;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface LcncFormFieldRepository extends JpaRepository<LcncFormField, UUID> {
    List<LcncFormField> findByFormIdOrderBySortOrderAsc(UUID formId);
}
