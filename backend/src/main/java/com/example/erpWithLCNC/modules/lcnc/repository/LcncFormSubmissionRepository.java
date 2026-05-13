package com.example.erpWithLCNC.modules.lcnc.repository;

import com.example.erpWithLCNC.modules.lcnc.entity.LcncFormSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import java.util.List;
import java.util.UUID;

@Repository
public interface LcncFormSubmissionRepository extends JpaRepository<LcncFormSubmission, UUID> {
    @Query(value = """
        SELECT s FROM LcncFormSubmission s
        WHERE s.form.id = :formId
        AND (:search IS NULL OR LOWER(CAST(s.data AS string)) LIKE :search)
        ORDER BY s.submittedAt DESC
    """)
    List<LcncFormSubmission> findByFormIdAndSearch(
            @Param("formId") UUID formId,
            @Param("search") String search
    );
}

