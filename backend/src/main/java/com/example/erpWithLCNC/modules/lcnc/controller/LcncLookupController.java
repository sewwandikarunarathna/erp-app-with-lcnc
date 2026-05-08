package com.example.erpWithLCNC.modules.lcnc.controller;

import com.example.erpWithLCNC.common.dto.ApiResponse;
import com.example.erpWithLCNC.modules.lcnc.dto.LookupDTO;
import com.example.erpWithLCNC.modules.lcnc.service.LcncLookupService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lcnc/lookup")
@RequiredArgsConstructor
@Tag(name = "LCNC - Lookups")
public class LcncLookupController {

    private final LcncLookupService lookupService;

    @GetMapping("/entities")
    public ResponseEntity<ApiResponse<List<String>>> getAvailableEntities() {
        return ResponseEntity.ok(ApiResponse.ok(lookupService.getAvailableEntities()));
    }

    @GetMapping("/{entityName}")
    public ResponseEntity<ApiResponse<List<LookupDTO>>> getLookupOptions(
            @PathVariable String entityName,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(ApiResponse.ok(lookupService.getLookupOptions(entityName, search)));
    }
}
