package com.example.erpWithLCNC.modules.lcnc.service;

import com.example.erpWithLCNC.modules.lcnc.entity.LcncEntityExtendedData;
import com.example.erpWithLCNC.modules.lcnc.entity.LcncForm;
import com.example.erpWithLCNC.modules.lcnc.entity.LcncFormField;
import com.example.erpWithLCNC.modules.lcnc.repository.LcncEntityExtendedDataRepository;
import com.example.erpWithLCNC.modules.lcnc.repository.LcncFormFieldRepository;
import com.example.erpWithLCNC.modules.lcnc.repository.LcncFormRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LcncService {

    private final LcncFormRepository formRepository;
    private final LcncFormFieldRepository fieldRepository;
    private final LcncEntityExtendedDataRepository extendedDataRepository;
    private final ObjectMapper objectMapper;

    public LcncForm getFormSchema(String formKey) {
        return formRepository.findByFormKey(formKey)
                .orElseThrow(() -> new RuntimeException("Form schema not found for key: " + formKey));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getExtendedData(String entityName, UUID entityId) {
        List<LcncEntityExtendedData> data = extendedDataRepository.findByEntityNameAndEntityId(entityName, entityId);
        return data.stream()
                .collect(Collectors.toMap(
                    LcncEntityExtendedData::getFieldKey, 
                    d -> objectMapper.convertValue(d.getFieldValue(), Object.class)
                ));
    }

    @Transactional
    public void saveExtendedData(String entityName, UUID entityId, Map<String, Object> extendedFields) {
        if (extendedFields == null) return;

        // Fetch existing data to update or delete
        List<LcncEntityExtendedData> existing = extendedDataRepository.findByEntityNameAndEntityId(entityName, entityId);
        Map<String, LcncEntityExtendedData> existingMap = existing.stream()
                .collect(Collectors.toMap(LcncEntityExtendedData::getFieldKey, d -> d));

        extendedFields.forEach((key, value) -> {
            LcncEntityExtendedData data = existingMap.get(key);
            JsonNode jsonValue = objectMapper.valueToTree(value);
            
            if (data != null) {
                data.setFieldValue(jsonValue);
            } else {
                data = LcncEntityExtendedData.builder()
                        .entityName(entityName)
                        .entityId(entityId)
                        .fieldKey(key)
                        .fieldValue(jsonValue)
                        .build();
            }
            extendedDataRepository.save(data);
        });
    }

    @Transactional
    public LcncForm updateFormFields(String formKey, List<LcncFormField> newFields) {
        LcncForm form = getFormSchema(formKey);
        
        // Clear existing fields and add new ones (simple replacement for now)
        form.getFields().clear();
        for (LcncFormField field : newFields) {
            field.setForm(form);
            form.getFields().add(field);
        }
        
        return formRepository.save(form);
    }
}
