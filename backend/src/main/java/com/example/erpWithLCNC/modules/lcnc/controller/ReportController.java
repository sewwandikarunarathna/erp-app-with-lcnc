package com.example.erpWithLCNC.modules.lcnc.controller;

import com.example.erpWithLCNC.common.dto.ApiResponse;
import com.example.erpWithLCNC.modules.lcnc.entity.ReportDefinition;
import com.example.erpWithLCNC.modules.lcnc.service.ReportService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/lcnc/reports")
@RequiredArgsConstructor
@Tag(name = "LCNC - Report & Widget Designer")
public class ReportController {

    private final ReportService reportService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ReportDefinition>>> getAvailableReports(@RequestParam UUID userId) {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getAvailableReports(userId)));
    }

    @PostMapping("/{reportId}/run")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> runReport(
            @PathVariable UUID reportId,
            @RequestBody Map<String, Object> filters
    ) {
        return ResponseEntity.ok(ApiResponse.ok(reportService.runReport(reportId, filters)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ReportDefinition>> createReport(@RequestBody ReportDefinition report) {
        return ResponseEntity.ok(ApiResponse.ok(reportService.createReport(report), "Report definition created"));
    }
}
