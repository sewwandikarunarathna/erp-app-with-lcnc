package com.example.erpWithLCNC.modules.lcnc.repository;

import com.example.erpWithLCNC.modules.lcnc.entity.LcncForm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LcncFormRepository extends JpaRepository<LcncForm, UUID> {
    Optional<LcncForm> findByFormKey(String formKey);
}
