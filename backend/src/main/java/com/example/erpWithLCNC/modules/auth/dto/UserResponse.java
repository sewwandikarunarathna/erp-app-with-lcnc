package com.example.erpWithLCNC.modules.auth.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Getter @Setter @Builder
public class UserResponse {
    private UUID id;
    private String email;
    private String fullName;
    private boolean active;
    private Set<String> roles;
    private LocalDateTime createdAt;
}