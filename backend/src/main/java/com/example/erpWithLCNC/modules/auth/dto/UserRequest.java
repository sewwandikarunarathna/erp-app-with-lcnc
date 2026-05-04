package com.example.erpWithLCNC.modules.auth.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.Set;

@Getter @Setter
public class UserRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotEmpty(message = "At least one role is required")
    private Set<String> roles;
}