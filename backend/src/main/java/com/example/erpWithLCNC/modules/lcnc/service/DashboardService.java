package com.example.erpWithLCNC.modules.lcnc.service;

import com.example.erpWithLCNC.modules.lcnc.entity.Dashboard;
import com.example.erpWithLCNC.modules.lcnc.repository.DashboardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final DashboardRepository dashboardRepository;

    public List<Dashboard> getUserDashboards(UUID userId) {
        return dashboardRepository.findByOwnerIdOrSharedTrue(userId);
    }

    public Dashboard getDefaultDashboard(UUID userId) {
        return dashboardRepository.findByOwnerIdAndIsDefaultTrue(userId)
                .orElseGet(() -> {
                    List<Dashboard> all = dashboardRepository.findByOwnerIdOrSharedTrue(userId);
                    return all.isEmpty() ? null : all.get(0);
                });
    }

    public Dashboard getDashboardById(UUID id) {
        return dashboardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dashboard not found"));
    }

    @Transactional
    public Dashboard saveDashboard(Dashboard dashboard) {
        if (Boolean.TRUE.equals(dashboard.getIsDefault())) {
            // Unset other defaults for this user
            dashboardRepository.findByOwnerIdAndIsDefaultTrue(dashboard.getOwnerId())
                    .ifPresent(d -> {
                        if (dashboard.getId() == null || !d.getId().equals(dashboard.getId())) {
                            d.setIsDefault(false);
                            dashboardRepository.save(d);
                        }
                    });
        }
        
        // Ensure child widgets know their parent
        if (dashboard.getWidgets() != null) {
            dashboard.getWidgets().forEach(w -> w.setDashboard(dashboard));
        }
        
        return dashboardRepository.save(dashboard);
    }

    @Transactional
    public void deleteDashboard(UUID id) {
        dashboardRepository.deleteById(id);
    }
}
