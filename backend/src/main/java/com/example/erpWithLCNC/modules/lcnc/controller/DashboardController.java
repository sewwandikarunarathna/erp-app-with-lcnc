package com.example.erpWithLCNC.modules.lcnc.controller;

import com.example.erpWithLCNC.common.dto.ApiResponse;
import com.example.erpWithLCNC.modules.lcnc.entity.Dashboard;
import com.example.erpWithLCNC.modules.lcnc.service.DashboardService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/lcnc/dashboards")
@RequiredArgsConstructor
@Tag(name = "LCNC - Dashboard Management")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<Dashboard>>> getDashboards(@RequestParam UUID userId) {
        // In a real app, userId would be extracted from the token
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getUserDashboards(userId)));
    }

    @GetMapping("/default")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Dashboard>> getDefaultDashboard(@RequestParam UUID userId) {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getDefaultDashboard(userId)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Dashboard>> getDashboardById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getDashboardById(id)));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Dashboard>> saveDashboard(@RequestBody Dashboard dashboard) {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.saveDashboard(dashboard), "Dashboard saved successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteDashboard(@PathVariable UUID id) {
        dashboardService.deleteDashboard(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Dashboard deleted"));
    }
}
