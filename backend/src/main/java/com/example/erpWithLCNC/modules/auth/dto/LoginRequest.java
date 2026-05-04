package com.example.erpWithLCNC.modules.auth.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter
public class LoginRequest {

    @NotBlank(message = "Email is required")
    @Email
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}