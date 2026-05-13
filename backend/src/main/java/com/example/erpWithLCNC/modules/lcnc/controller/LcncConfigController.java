package com.example.erpWithLCNC.modules.lcnc.controller;

import com.example.erpWithLCNC.common.dto.ApiResponse;
import com.example.erpWithLCNC.modules.lcnc.dto.FormSubmissionDTO;
import com.example.erpWithLCNC.modules.lcnc.entity.LcncForm;
import com.example.erpWithLCNC.modules.lcnc.entity.LcncFormField;
import com.example.erpWithLCNC.modules.lcnc.service.LcncService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/lcnc/forms")
@RequiredArgsConstructor
@Tag(name = "LCNC - Form Management")
public class LcncConfigController {

    private final LcncService lcncService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<LcncForm>> createForm(@RequestBody LcncForm form) {
        return ResponseEntity.ok(ApiResponse.ok(lcncService.createForm(form), "Form created successfully"));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<LcncForm>>> getAllForms() {
        return ResponseEntity.ok(ApiResponse.ok(lcncService.getAllForms()));
    }

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

    @PostMapping("/{formKey}/submit")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<FormSubmissionDTO>> submitForm(
            @PathVariable String formKey,
            @RequestBody Map<String, Object> data
    ) {
        return ResponseEntity.ok(ApiResponse.ok(lcncService.submitForm(formKey, data), "Form submitted successfully"));
    }

    @GetMapping("/{formKey}/submissions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<FormSubmissionDTO>>> getSubmissions(
            @PathVariable String formKey,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(ApiResponse.ok(lcncService.getSubmissions(formKey, search)));
    }
}

