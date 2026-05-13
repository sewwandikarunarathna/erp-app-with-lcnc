package com.example.erpWithLCNC.modules.lcnc.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FormSubmissionDTO {
    private UUID id;
    private Map<String, Object> data;
    private String reference;
    private LocalDateTime submittedAt;
}
