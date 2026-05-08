package com.example.erpWithLCNC.modules.lcnc.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LookupDTO {
    private UUID id;
    private String label;
}
