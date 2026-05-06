package com.example.erpWithLCNC.modules.auth.service;

import com.example.erpWithLCNC.common.exception.BusinessException;
import com.example.erpWithLCNC.common.exception.ResourceNotFoundException;
import com.example.erpWithLCNC.config.security.JwtUtil;
import com.example.erpWithLCNC.modules.auth.dto.*;
import com.example.erpWithLCNC.modules.auth.entity.*;
import com.example.erpWithLCNC.modules.auth.mapper.UserMapper;
import com.example.erpWithLCNC.modules.auth.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        Set<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());

        return LoginResponse.builder()
                .token(jwtUtil.generateToken(user.getEmail(), roles))
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(roles)
                .build();
    }

    @Transactional
    public UserResponse createUser(UserRequest request) {
        if (userRepository.existsByEmail(request.getEmail()))
            throw new BusinessException("Email already in use: " + request.getEmail());

        Set<Role> roles = request.getRoles().stream()
                .map(name -> roleRepository.findByName(name)
                        .orElseThrow(() -> new ResourceNotFoundException("Role", "name", name)))
                .collect(Collectors.toSet());

        User user = User.builder()
                .email(request.getEmail())
                .fullName(request.getFullName())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .roles(roles)
                .active(true)
                .build();

        return userMapper.toResponse(userRepository.save(user));
    }

    public Page<UserResponse> getUsers(String search, int page, int size) {
        String searchPattern = (search != null && !search.trim().isEmpty()) ? "%" + search.toLowerCase() + "%" : null;

        Pageable pageable = PageRequest.of(page, size, Sort.by("fullName").ascending());
        return userRepository.searchUsers(searchPattern, pageable)
                .map(userMapper::toResponse);
    }


    public UserResponse getUser(java.util.UUID id) {
        return userRepository.findById(id)
                .map(userMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }
}