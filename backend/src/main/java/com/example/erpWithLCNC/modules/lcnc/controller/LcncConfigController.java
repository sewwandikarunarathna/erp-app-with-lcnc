package com.example.erpWithLCNC.modules.lcnc.controller;

import com.example.erpWithLCNC.common.dto.ApiResponse;
import com.example.erpWithLCNC.modules.lcnc.entity.LcncForm;
import com.example.erpWithLCNC.modules.lcnc.entity.LcncFormField;
import com.example.erpWithLCNC.modules.lcnc.service.LcncService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lcnc/forms")
@RequiredArgsConstructor
@Tag(name = "LCNC - Form Management")
public class LcncConfigController {

    private final LcncService lcncService;

    @GetMapping("/{formKey}")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY')")
    public ResponseEntity<ApiResponse<LcncForm>> getFormSchema(@PathVariable String formKey) {
        return ResponseEntity.ok(ApiResponse.ok(lcncService.getFormSchema(formKey)));
    }

    @PutMapping("/{formKey}/fields")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<LcncForm>> updateFormFields(
            @PathVariable String formKey,
            @RequestBody List<LcncFormField> fields
    ) {
        return ResponseEntity.ok(ApiResponse.ok(lcncService.updateFormFields(formKey, fields), "Form schema updated"));
    }
}
