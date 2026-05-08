package com.example.erpWithLCNC.modules.lcnc.service;

import com.example.erpWithLCNC.modules.auth.repository.UserRepository;
import com.example.erpWithLCNC.modules.inventory.repository.ProductRepository;
import com.example.erpWithLCNC.modules.lcnc.dto.LookupDTO;
import com.example.erpWithLCNC.modules.lcnc.repository.LcncFormRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LcncLookupService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final LcncFormRepository formRepository;

    @Transactional(readOnly = true)
    public List<LookupDTO> getLookupOptions(String entityName, String search) {
        String searchTerm = search != null ? "%" + search.toLowerCase() + "%" : "%%";
        
        switch (entityName.toUpperCase()) {
            case "PRODUCT":
                return productRepository.searchProducts(searchTerm, null, PageRequest.of(0, 20))
                        .getContent().stream()
                        .map(p -> new LookupDTO(p.getId(), p.getName() + " (" + p.getSku() + ")"))
                        .collect(Collectors.toList());
            
            case "USER":
                return userRepository.findAll().stream() // Simplified for now
                        .filter(u -> search == null || u.getFullName().toLowerCase().contains(search.toLowerCase()))
                        .limit(20)
                        .map(u -> new LookupDTO(u.getId(), u.getFullName()))
                        .collect(Collectors.toList());
            
            default:
                throw new RuntimeException("Lookup entity not supported: " + entityName);
        }
    }

    public List<String> getAvailableEntities() {
        List<String> entities = new java.util.ArrayList<>(List.of("PRODUCT", "USER", "SUPPLIER"));
        entities.addAll(formRepository.findAll().stream()
                .map(f -> f.getFormKey().toUpperCase())
                .filter(key -> !entities.contains(key))
                .toList());
        return entities;
    }
}
