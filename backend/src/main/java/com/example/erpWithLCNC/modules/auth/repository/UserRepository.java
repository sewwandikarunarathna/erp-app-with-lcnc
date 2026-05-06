package com.example.erpWithLCNC.modules.auth.repository;

import com.example.erpWithLCNC.modules.auth.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("""
        SELECT u FROM User u
        WHERE u.active = true
        AND (:search IS NULL
             OR LOWER(u.fullName) LIKE :search
             OR LOWER(u.email)    LIKE :search)

        """)
    Page<User> searchUsers(@Param("search") String search, Pageable pageable);

}