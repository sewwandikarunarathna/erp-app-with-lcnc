package com.example.erpWithLCNC.modules.auth.dto;

import lombok.*;

import java.util.Set;

@Getter @Setter @Builder
public class LoginResponse {
    private String token;
    private String email;
    private String fullName;
    private Set<String> roles;
}