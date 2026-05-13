-- Form Submissions (Scenario 1 — standalone CUSTOM forms with no entity_table)
-- Stores the submitted JSONB data blob for each submission of a custom form.
CREATE TABLE lcnc_form_submissions (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id      UUID NOT NULL REFERENCES lcnc_forms(id) ON DELETE CASCADE,
    data         JSONB NOT NULL,                 -- {"supplier_name":"ABC","score":85}
    reference    VARCHAR(255),                   -- optional external link (e.g. order ID)
    submitted_at TIMESTAMP DEFAULT NOW()
);

-- GIN index for fast JSONB searches
CREATE INDEX idx_form_submissions_form_id ON lcnc_form_submissions(form_id);
CREATE INDEX idx_form_submissions_data    ON lcnc_form_submissions USING GIN(data);
