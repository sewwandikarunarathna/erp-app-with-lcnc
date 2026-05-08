
## Dynamic Form Builder — Two Scenarios

---

### Core Data Model (PostgreSQL)

This is the foundation everything sits on. Get this right and both scenarios work cleanly.

**Form Registry & Schema Storage**

```sql
-- Master registry of all forms (both generated and extended)
CREATE TABLE forms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_key      VARCHAR(100) UNIQUE NOT NULL,  -- e.g. 'supplier_evaluation', 'order'
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  form_type     VARCHAR(50) DEFAULT 'CUSTOM',  -- 'SYSTEM' | 'CUSTOM'
  entity_table  VARCHAR(100),                  -- linked DB table if any
  version       INTEGER DEFAULT 1,
  is_active     BOOLEAN DEFAULT TRUE,
  created_by    UUID,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- All field definitions live here (both new forms AND extended fields)
CREATE TABLE form_fields (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id         UUID REFERENCES forms(id) ON DELETE CASCADE,
  field_key       VARCHAR(100) NOT NULL,       -- e.g. 'supplier_name', 'charges'
  label           VARCHAR(255) NOT NULL,
  field_type      VARCHAR(50) NOT NULL,        -- see Field Type Registry below
  placeholder     TEXT,
  default_value   TEXT,
  is_required     BOOLEAN DEFAULT FALSE,
  is_system_field BOOLEAN DEFAULT FALSE,       -- TRUE = came from original code
  is_visible      BOOLEAN DEFAULT TRUE,
  is_readonly     BOOLEAN DEFAULT FALSE,
  sort_order      INTEGER DEFAULT 0,
  section_id      UUID,                        -- optional grouping
  validation      JSONB,   -- {"min":0, "max":999999, "pattern":"^[A-Z]"}
  options         JSONB,   -- for dropdowns: [{"label":"Active","value":"ACTIVE"}]
  conditions      JSONB,   -- conditional visibility rules
  metadata        JSONB,   -- extra config per field type
  created_at      TIMESTAMP DEFAULT NOW(),
  UNIQUE(form_id, field_key)
);

-- Layout sections within a form
CREATE TABLE form_sections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id     UUID REFERENCES forms(id) ON DELETE CASCADE,
  title       VARCHAR(255),
  description TEXT,
  columns     INTEGER DEFAULT 1,   -- 1, 2, or 3 column grid
  sort_order  INTEGER DEFAULT 0,
  conditions  JSONB                -- show/hide entire section conditionally
);

-- Version snapshots — full JSONB snapshot per version
CREATE TABLE form_versions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id     UUID REFERENCES forms(id),
  version     INTEGER NOT NULL,
  snapshot    JSONB NOT NULL,      -- complete form + fields at that version
  changed_by  UUID,
  change_note TEXT,
  created_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE(form_id, version)
);

-- Stores submitted data for CUSTOM forms (no entity_table)
CREATE TABLE form_submissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id     UUID REFERENCES forms(id),
  reference   VARCHAR(255),        -- e.g. linked order ID
  data        JSONB NOT NULL,      -- {"supplier_name":"ABC","score":85}
  submitted_by UUID,
  submitted_at TIMESTAMP DEFAULT NOW()
);

-- EXTENDED fields data (for system forms like Order)
CREATE TABLE entity_extended_data (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_name  VARCHAR(100) NOT NULL,  -- 'order'
  entity_id    UUID NOT NULL,          -- the actual order UUID
  field_key    VARCHAR(100) NOT NULL,
  field_value  JSONB,                  -- typed value stored as JSONB
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW(),
  UNIQUE(entity_name, entity_id, field_key)
);

-- Indexes for performance
CREATE INDEX idx_form_fields_form_id ON form_fields(form_id, sort_order);
CREATE INDEX idx_form_fields_section ON form_fields(section_id);
CREATE INDEX idx_submissions_form_id ON form_submissions(form_id);
CREATE INDEX idx_submissions_data ON form_submissions USING GIN(data);
CREATE INDEX idx_ext_data_entity ON entity_extended_data(entity_name, entity_id);
CREATE INDEX idx_ext_data_field ON entity_extended_data(entity_name, field_key);
```

---

### Scenario 1 — Create a Full Form ("Supplier Evaluation Form")

**How it flows end-to-end:**

```
User opens Form Builder UI
  → Drags fields onto canvas
  → Configures labels, types, validations
  → Clicks Save
    → POST /api/forms  (Spring Boot)
      → Validates schema
      → Inserts into forms + form_fields + form_sections
      → Snapshots version into form_versions
  → React renders the live form for data entry
  → User submits → POST /api/forms/{formKey}/submit
    → Spring Boot validates each field against its rules
    → Saves to form_submissions as JSONB
```

**Spring Boot — Service Layer Logic**

```java
// FormService.java
@Transactional
public FormDTO createForm(CreateFormRequest request, UUID createdBy) {

    // 1. Check form_key uniqueness
    if (formRepository.existsByFormKey(request.getFormKey()))
        throw new DuplicateFormKeyException(request.getFormKey());

    // 2. Build and save Form entity
    Form form = Form.builder()
        .formKey(request.getFormKey())
        .name(request.getName())
        .formType(FormType.CUSTOM)
        .createdBy(createdBy)
        .build();
    form = formRepository.save(form);

    // 3. Save sections
    saveSections(form, request.getSections());

    // 4. Save fields with sort_order preserved
    saveFields(form, request.getFields());

    // 5. Snapshot this as version 1
    snapshotVersion(form, createdBy, "Initial creation");

    return toDTO(form);
}

// FormSubmissionService.java
@Transactional
public void submitForm(String formKey, Map<String, Object> data, UUID userId) {

    Form form = formRepository.findByFormKey(formKey).orElseThrow();
    List<FormField> fields = fieldRepository.findByFormIdOrdered(form.getId());

    // Validate each field value
    Map<String, List<String>> errors = new HashMap<>();
    for (FormField field : fields) {
        Object value = data.get(field.getFieldKey());
        List<String> fieldErrors = fieldValidator.validate(field, value);
        if (!fieldErrors.isEmpty()) errors.put(field.getFieldKey(), fieldErrors);
    }
    if (!errors.isEmpty()) throw new FormValidationException(errors);

    // Persist submission
    FormSubmission submission = FormSubmission.builder()
        .formId(form.getId())
        .data(objectMapper.valueToTree(data))
        .submittedBy(userId)
        .build();
    submissionRepository.save(submission);
}
```

**Field Validator — handles all types**

```java
// FieldValidator.java
public List<String> validate(FormField field, Object value) {
    List<String> errors = new ArrayList<>();

    if (field.isRequired() && (value == null || value.toString().isBlank())) {
        errors.add(field.getLabel() + " is required");
        return errors;  // skip further checks if empty
    }
    if (value == null) return errors;

    JsonNode rules = field.getValidation();
    if (rules == null) return errors;

    switch (field.getFieldType()) {
        case "NUMBER", "CURRENCY" -> {
            double num = Double.parseDouble(value.toString());
            if (rules.has("min") && num < rules.get("min").asDouble())
                errors.add(field.getLabel() + " must be ≥ " + rules.get("min"));
            if (rules.has("max") && num > rules.get("max").asDouble())
                errors.add(field.getLabel() + " must be ≤ " + rules.get("max"));
        }
        case "TEXT", "TEXTAREA" -> {
            String str = value.toString();
            if (rules.has("minLength") && str.length() < rules.get("minLength").asInt())
                errors.add(field.getLabel() + " is too short");
            if (rules.has("pattern") && !str.matches(rules.get("pattern").asText()))
                errors.add(field.getLabel() + " format is invalid");
        }
        case "DATE" -> {
            // parse and compare against min/max date rules
        }
    }
    return errors;
}
```

---

### Scenario 2 — Add Fields to an Existing System Form ("charges" on Order Form)

This is architecturally different. The Order form is a **system form** — it's backed by a real `orders` table in PostgreSQL. You can't just add a column dynamically. So you use a **sidecar extension table** (`entity_extended_data`) to store added fields without touching the original schema.

**How it flows:**

```
Admin opens Order Form in Form Builder
  → Sees existing system fields (read-only — marked is_system_field=TRUE)
  → Drags a new "charges" NUMBER field into the form
  → Saves → PATCH /api/forms/order/fields
    → Spring Boot inserts into form_fields with is_system_field=FALSE
    → Extended data storage route is activated for this field
  → User opens an Order record
    → GET /api/orders/{id} → returns core order data
    → GET /api/forms/order/extended/{id} → returns extended field values
    → React merges both into a unified form view
  → User fills in "charges" → saves
    → POST /api/forms/order/extended/{id}
      → Upserts into entity_extended_data
```

**Spring Boot — Extended Field Service**

```java
// ExtendedFieldService.java
@Transactional
public void saveExtendedFields(String entityName, UUID entityId,
                                Map<String, Object> extendedData) {

    List<FormField> extFields = fieldRepository
        .findExtendedFields(entityName);  // is_system_field = FALSE

    for (FormField field : extFields) {
        Object value = extendedData.get(field.getFieldKey());
        if (value == null) continue;

        // Validate value against field rules
        List<String> errors = fieldValidator.validate(field, value);
        if (!errors.isEmpty())
            throw new FormValidationException(Map.of(field.getFieldKey(), errors));

        // Upsert into entity_extended_data
        extendedDataRepository.upsert(
            entityName,
            entityId,
            field.getFieldKey(),
            objectMapper.valueToTree(value)
        );
    }
}

// Upsert query using PostgreSQL ON CONFLICT
@Modifying
@Query(value = """
    INSERT INTO entity_extended_data (entity_name, entity_id, field_key, field_value)
    VALUES (:entityName, :entityId, :fieldKey, :fieldValue::jsonb)
    ON CONFLICT (entity_name, entity_id, field_key)
    DO UPDATE SET field_value = :fieldValue::jsonb, updated_at = NOW()
    """, nativeQuery = true)
void upsert(String entityName, UUID entityId, String fieldKey, String fieldValue);
```

**Unified data retrieval — merge core + extended**

```java
// OrderService.java
public OrderDetailDTO getOrder(UUID orderId) {

    // 1. Core order from orders table
    Order order = orderRepository.findById(orderId).orElseThrow();
    OrderDetailDTO dto = mapper.toDTO(order);

    // 2. Fetch extended field values
    List<EntityExtendedData> extData =
        extendedDataRepository.findByEntityNameAndEntityId("order", orderId);

    // 3. Merge into a flat map and attach
    Map<String, Object> extended = extData.stream()
        .collect(Collectors.toMap(
            EntityExtendedData::getFieldKey,
            e -> objectMapper.convertValue(e.getFieldValue(), Object.class)
        ));
    dto.setExtendedFields(extended);

    return dto;
}
```

---

### React.js — Form Builder UI

**Component Architecture**

```
<FormBuilderPage>
  ├── <FieldPalette />          ← draggable field types
  ├── <FormCanvas />            ← drop zone, renders fields in order
  │     └── <FieldCard />       ← each field, shows label + type + actions
  ├── <FieldConfigPanel />      ← right panel: edit selected field's config
  └── <FormToolbar />           ← Save, Preview, Version History buttons
```

**Key libraries:**
- `@dnd-kit/core` — drag-and-drop for the canvas (lighter than react-beautiful-dnd)
- `react-hook-form` — powers the live preview form
- `zod` — client-side schema validation mirroring server rules
- `@tanstack/react-query` — fetching and caching form schemas

**Dynamic Form Renderer** (used both in builder preview and in actual form pages)

```jsx
// DynamicFormRenderer.jsx
export function DynamicFormRenderer({ formKey, entityId, onSubmit }) {
  const { data: schema } = useQuery(['form-schema', formKey],
    () => api.get(`/api/forms/${formKey}/schema`));

  const { data: existingData } = useQuery(
    ['form-data', formKey, entityId],
    () => entityId ? api.get(`/api/forms/${formKey}/data/${entityId}`) : null,
    { enabled: !!entityId }
  );

  const form = useForm({ defaultValues: existingData?.data });

  if (!schema) return <Spinner />;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {schema.sections.map(section => (
        <FormSection key={section.id} section={section}>
          {schema.fields
            .filter(f => f.sectionId === section.id && evaluateCondition(f.conditions, form.watch()))
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map(field => (
              <DynamicField
                key={field.fieldKey}
                field={field}
                control={form.control}
                errors={form.formState.errors}
              />
            ))}
        </FormSection>
      ))}
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

**Conditional Field Visibility evaluator**

```js
// evaluateCondition.js
// Field conditions stored as: { "field": "payment_type", "operator": "eq", "value": "CREDIT" }
export function evaluateCondition(conditions, formValues) {
  if (!conditions || conditions.length === 0) return true;
  return conditions.every(cond => {
    const actual = formValues[cond.field];
    switch (cond.operator) {
      case 'eq':  return actual === cond.value;
      case 'neq': return actual !== cond.value;
      case 'gt':  return Number(actual) > Number(cond.value);
      case 'in':  return cond.value.includes(actual);
      default:    return true;
    }
  });
}
```

---

### Field Type Registry

Every field type needs a consistent definition understood by all three layers:

| Field Type | PostgreSQL (JSONB value) | Spring Boot Validator | React Component |
|---|---|---|---|
| `TEXT` | `"ABC Corp"` | length, pattern | `<input type="text">` |
| `TEXTAREA` | `"Long text..."` | minLength, maxLength | `<textarea>` |
| `NUMBER` | `1500` | min, max | `<input type="number">` |
| `CURRENCY` | `1500.00` | min, max, precision | Custom currency input |
| `DATE` | `"2025-06-01"` | minDate, maxDate | Date picker |
| `DROPDOWN` | `"ACTIVE"` | options enum check | `<Select>` |
| `MULTI_SELECT` | `["A","B"]` | options enum check | Multi-select |
| `CHECKBOX` | `true` | boolean | `<Checkbox>` |
| `FILE` | `"s3://path/file.pdf"` | maxSize, mimeType | File uploader |
| `LOOKUP` | `{id, label}` | entity existence check | Async search input |
| `CALCULATED` | computed | read-only, no input | Display only |

---

---

## Technical Suggestions & Implementation Challenges

### Suggestions for Improvement
1. **Field Dependency Engine**: Implement a simple JSON-based logic engine to allow fields to show/hide or change values based on other field inputs (e.g., if 'Category' is 'Electronics', show 'Warranty Period').
2. **Metadata Versioning**: Instead of overwriting form schemas, use a versioning system. This ensures that historical data submitted with an old schema remains valid and can be rendered correctly even if fields are deleted later.
3. **Advanced Field Types**: Add support for 'Lookup' fields that can query other entities (e.g., selecting a 'Supplier' from the suppliers table directly in a custom field).
4. **Permissions at Field Level**: Allow configuring which roles can see or edit specific custom fields.

### Challenges to Address
1. **Searchability**: Searching and filtering by custom field values (stored in JSONB) can be performance-intensive. Consider using GIN indexes in PostgreSQL or synchronizing specific fields to a search index like Elasticsearch.
2. **Data Consistency**: If a custom field is renamed or its type is changed, the existing data in 'entity_extended_data' might become orphaned or invalid. A data migration tool for LCNC fields is recommended.
3. **Complex Validations**: Implementing cross-field validation (e.g., 'Field A must be greater than Field B') in a dynamic way requires a more robust expression evaluator (like SpEL in backend and a safe JS evaluator in frontend).
4. **Performance Overhead**: Fetching schemas and extended data for every record in a large list can be slow. Implementation of an efficient caching layer (e.g., Redis for schemas) is crucial as the system scales.

## Soltion to Challenges no.2
Listed directory erp-with-LCNC
Viewed LCNC_concepts:1-434
Searched for "entity_extended_data"
Listed directory lcnc
Listed directory service
Viewed LcncService.java:1-86
Viewed LcncFormField.java:1-52
Viewed LcncEntityExtendedDataRepository.java:1-13

To handle data consistency in an LCNC (Low-Code/No-Code) system when fields are modified, you need a **Dynamic Data Migration Engine**. 

When an admin changes a field definition (e.g., renames `price` to `unit_price` or changes a `TEXT` field to `NUMBER`), the database records in `entity_extended_data` (sidecar data) or `form_submissions` (JSONB blobs) become "orphaned" because they still use the old key or store the wrong data type.

### The Strategy: "Detect, Plan, Migrate"

The key to a robust migration tool is treating schema changes as **transactions** that involve both metadata (the field definition) and the data itself.

#### 1. Change Detection (Tracking by ID)
Instead of just replacing fields, you must track them using a persistent `UUID`.
*   **Rename**: If `id` remains the same but `fieldKey` changes.
*   **Type Change**: If `id` remains the same but `fieldType` changes.
*   **Deletion**: If an `id` present in the old schema is missing in the new one.

#### 2. Migration Lifecycle
1.  **Diff Generation**: Calculate what changed between the current schema and the proposed update.
2.  **Impact Analysis**: Query the database to see how many records are affected.
3.  **Migration Execution**: Run bulk SQL updates to transform the data.

---

### Implementation Guide

I have drafted a detailed implementation plan for an `LcncMigrationService` that handles these scenarios using high-performance PostgreSQL JSONB operations.

[LCNC Data Migration Implementation Plan](file:///C:/Users/Rizer/Documents/Rizerr/erp-with-LCNC/LCNC_migration_plan.md)

```java
// Conceptual example of a Migration Step
@Transactional
public void migrateFieldRename(String entityName, String oldKey, String newKey) {
    // 1. Update the sidecar table (entity_extended_data)
    extendedDataRepository.renameFieldKey(entityName, oldKey, newKey);
    
    // 2. Update JSONB blobs in submissions (form_submissions)
    submissionRepository.renameJsonKey(entityName, oldKey, newKey);
}
```

### 1. Handling Field Renames (SQL)
To rename a key in a JSONB column across thousands of records efficiently, use PostgreSQL's `jsonb_set`:

```sql
-- Rename 'old_key' to 'new_key' in a JSONB column named 'data'
UPDATE form_submissions 
SET data = (data - 'old_key') || jsonb_build_object('new_key', data->'old_key')
WHERE form_id = :formId AND data ? 'old_key';
```

### 2. Handling Type Conversions
If a field changes from `TEXT` to `NUMBER`, you can attempt a bulk cast, while flagging errors:

```sql
-- Convert string to number, but only if it's a valid numeric string
UPDATE entity_extended_data
SET field_value = to_jsonb((field_value#>>'{}')::numeric),
    updated_at = NOW()
WHERE field_key = :fieldKey 
  AND field_value#>>'{}' ~ '^[0-9.]+$'; -- Regex to ensure it's numeric
```

### 3. Recommendation: The "Staging" UI
Don't apply these changes silently. Provide a UI for the Admin that says:
> "Renaming 'Cost' to 'Unit Price' will affect **450** records. Changing type to **Number** will fail for **3** records (invalid data). Do you want to proceed?"

Would you like me to implement the actual migration service class in your Spring Boot backend? I can start by adding the necessary repository methods.

---

### Summary of proposed changes:
- Created an implementation plan artifact: `LCNC_migration_plan.md`.
- Explained the "Persistent ID" strategy for tracking renames.
- Provided SQL patterns for bulk JSONB updates.
- Suggested an "Impact Analysis" workflow for the UI.