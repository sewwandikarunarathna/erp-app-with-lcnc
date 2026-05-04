package com.example.erpWithLCNC.modules.auth.mapper;

import com.example.erpWithLCNC.modules.auth.dto.UserResponse;
import com.example.erpWithLCNC.modules.auth.entity.Role;
import com.example.erpWithLCNC.modules.auth.entity.User;
import org.mapstruct.*;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

    @Mapping(target = "roles", expression = "java(mapRoles(user.getRoles()))")
    UserResponse toResponse(User user);

    default Set<String> mapRoles(Set<Role> roles) {
        if (roles == null) return Set.of();
        return roles.stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
    }
}