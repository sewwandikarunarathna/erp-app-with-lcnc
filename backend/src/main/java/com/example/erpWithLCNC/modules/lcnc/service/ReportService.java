package com.example.erpWithLCNC.modules.lcnc.service;

import com.example.erpWithLCNC.modules.lcnc.entity.ReportDefinition;
import com.example.erpWithLCNC.modules.lcnc.repository.ReportDefinitionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportDefinitionRepository reportRepository;
    private final ReportQueryBuilder queryBuilder;
    private final ObjectMapper objectMapper;

    public List<ReportDefinition> getAvailableReports(UUID userId) {
        return reportRepository.findByOwnerIdOrSharedTrue(userId);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> runReport(UUID reportId, Map<String, Object> filters) {
        System.out.println("reportId: " + reportId);
        ReportDefinition report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        
        // TODO: Implement caching logic here using ReportCache repository
        
        return queryBuilder.execute(report, filters);
    }

    @Transactional
    public ReportDefinition createReport(ReportDefinition report) {
        return reportRepository.save(report);
    }
}
