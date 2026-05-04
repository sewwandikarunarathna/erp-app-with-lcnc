package com.example.erpWithLCNC.modules.auth.dto;

import lombok.*;
import java.util.UUID;

@Getter @Setter @Builder
public class RoleResponse {
    private UUID id;
    private String name;
    private String description;
}