package com.example.erpWithLCNC.modules.auth.dto;

import lombok.*;

import java.util.Set;

@Getter @Setter @Builder
public class LoginResponse {
    private java.util.UUID id;
    private String token;
    private String email;
    private String fullName;
    private Set<String> roles;
}