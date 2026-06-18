-- ============================================================
-- Migration 001: Create WSIB Rehabilitation Schema
-- Project: RehabOS Showcase
-- All data in this database is SYNTHETIC — demo purposes only
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- LOOKUP / REFERENCE TABLES
-- ============================================================

-- Referral sources (lawyers, insurers, physicians, case managers)
CREATE TABLE referral_sources (
    referral_source_id  SERIAL PRIMARY KEY,
    name                VARCHAR(120) NOT NULL,
    type                VARCHAR(40) NOT NULL CHECK (type IN ('insurer','lawyer','physician','case_manager','self','hospital','other')),
    contact_name        VARCHAR(80),
    contact_phone       VARCHAR(20),
    contact_email       VARCHAR(100),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE referral_sources IS 'Organizations and individuals who refer clients to FunctionAbility';

-- Insurers / funders
CREATE TABLE insurers (
    insurer_id      SERIAL PRIMARY KEY,
    name            VARCHAR(120) NOT NULL,
    type            VARCHAR(30) NOT NULL CHECK (type IN ('wsib','auto','private','ehc','ltd','legal','self_pay')),
    contact_phone   VARCHAR(20),
    contact_email   VARCHAR(100),
    billing_portal  VARCHAR(200),   -- e.g. TELUS Health eServices for WSIB
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE insurers IS 'Funders: WSIB, auto insurers, private health, LTD carriers';

-- Facilities / service locations
CREATE TABLE facilities (
    facility_id     SERIAL PRIMARY KEY,
    name            VARCHAR(120) NOT NULL,
    type            VARCHAR(30) NOT NULL CHECK (type IN ('in_home','clinic','hospital','school','workplace','community')),
    address         VARCHAR(200),
    city            VARCHAR(60),
    province        CHAR(2) NOT NULL DEFAULT 'ON',
    postal_code     VARCHAR(7),
    region          VARCHAR(50),    -- GTA / Ottawa / Niagara / London
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE facilities IS 'Service locations. In-home visits bill at higher WSIB rate (5101 vs 5100).';

-- WSIB and non-WSIB billing service codes
CREATE TABLE service_codes (
    service_code    VARCHAR(10) PRIMARY KEY,
    description     VARCHAR(200) NOT NULL,
    fee_cad         NUMERIC(8,2) NOT NULL,
    discipline      VARCHAR(30),    -- OT / PT / SLP / Physician / All
    form_type       VARCHAR(20),    -- Form8 / Form26 / FAF / Visit / Other
    effective_date  DATE NOT NULL DEFAULT '2026-01-01',
    notes           TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

COMMENT ON TABLE service_codes IS 'WSIB fee schedule codes. 2.0% CPI increase applied Jan 2026. Verify current rates before billing.';

-- ============================================================
-- CORE ENTITIES
-- ============================================================

-- Clients (injured workers / patients) — all SYNTHETIC in demo
CREATE TABLE clients (
    client_id           SERIAL PRIMARY KEY,
    first_name          VARCHAR(60) NOT NULL,
    last_name           VARCHAR(60) NOT NULL,
    date_of_birth       DATE,
    sex                 CHAR(1) CHECK (sex IN ('M','F','X')),
    preferred_language  CHAR(2) NOT NULL DEFAULT 'EN' CHECK (preferred_language IN ('EN','FR')),
    -- Contact
    phone               VARCHAR(20),
    email               VARCHAR(100),
    address             VARCHAR(200),
    city                VARCHAR(60),
    province            CHAR(2) NOT NULL DEFAULT 'ON',
    postal_code         VARCHAR(7),
    -- Admin
    referral_source_id  INT REFERENCES referral_sources(referral_source_id),
    primary_funder      VARCHAR(30) CHECK (primary_funder IN ('wsib','auto','private','ehc','ltd','legal','self_pay')),
    intake_date         DATE NOT NULL DEFAULT CURRENT_DATE,
    discharge_date      DATE,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clients_last_name ON clients(last_name);
CREATE INDEX idx_clients_is_active ON clients(is_active);
CREATE INDEX idx_clients_primary_funder ON clients(primary_funder);

COMMENT ON TABLE clients IS 'SYNTHETIC DATA ONLY — all names are fictitious for demo purposes';

-- Clinicians (OT, PT, SLP, SW)
CREATE TABLE clinicians (
    clinician_id            SERIAL PRIMARY KEY,
    first_name              VARCHAR(60) NOT NULL,
    last_name               VARCHAR(60) NOT NULL,
    designation             VARCHAR(10) NOT NULL CHECK (designation IN ('OT','PT','SLP','SW','RT','CM')),
    college_registration_no VARCHAR(20),    -- e.g. CAOT / CPO registration
    wsib_provider_id        VARCHAR(20),    -- Required for WSIB billing
    hst_number              VARCHAR(20),    -- If registered
    email                   VARCHAR(100),
    phone                   VARCHAR(20),
    region                  VARCHAR(50),
    hourly_cost             NUMERIC(8,2),   -- Internal cost for utilization analysis
    is_active               BOOLEAN NOT NULL DEFAULT TRUE,
    hire_date               DATE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clinicians_designation ON clinicians(designation);
CREATE INDEX idx_clinicians_region ON clinicians(region);
CREATE INDEX idx_clinicians_is_active ON clinicians(is_active);

-- ============================================================
-- CLAIMS & TREATMENT
-- ============================================================

-- WSIB / insurer claims
CREATE TABLE wsib_claims (
    claim_id            SERIAL PRIMARY KEY,
    client_id           INT NOT NULL REFERENCES clients(client_id),
    insurer_id          INT NOT NULL REFERENCES insurers(insurer_id),
    claim_number        VARCHAR(20) UNIQUE,         -- WSIB-assigned (blank until issued)
    date_of_incident    DATE NOT NULL,
    employer_name       VARCHAR(120),
    worker_occupation   VARCHAR(100),
    -- Clinical
    body_parts_affected VARCHAR(200),               -- Comma-separated: 'L shoulder, neck'
    injury_type         VARCHAR(60),                -- sprain/strain, TBI, SCI, etc.
    diagnosis           VARCHAR(200),               -- ICD-10 preferred
    poc_type            VARCHAR(50),                -- MSK / mTBI / Complex
    -- Status
    status              VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','allowed','denied','under_review','closed')),
    -- Dates
    form8_submitted_at  TIMESTAMPTZ,
    allowed_at          TIMESTAMPTZ,
    closed_at           TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wsib_claims_client_id ON wsib_claims(client_id);
CREATE INDEX idx_wsib_claims_status ON wsib_claims(status);
CREATE INDEX idx_wsib_claims_date_of_incident ON wsib_claims(date_of_incident);
CREATE INDEX idx_wsib_claims_insurer_id ON wsib_claims(insurer_id);

-- Treatment plans
CREATE TABLE treatment_plans (
    plan_id         SERIAL PRIMARY KEY,
    claim_id        INT NOT NULL REFERENCES wsib_claims(claim_id),
    clinician_id    INT NOT NULL REFERENCES clinicians(clinician_id),
    goals           TEXT NOT NULL,
    frequency       VARCHAR(60),            -- e.g. '2x/week x 6 weeks'
    start_date      DATE NOT NULL,
    end_date        DATE,
    status          VARCHAR(20) NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','completed','discontinued','on_hold')),
    review_date     DATE,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_treatment_plans_claim_id ON treatment_plans(claim_id);
CREATE INDEX idx_treatment_plans_clinician_id ON treatment_plans(clinician_id);
CREATE INDEX idx_treatment_plans_status ON treatment_plans(status);

-- ============================================================
-- APPOINTMENTS & DOCUMENTATION
-- ============================================================

-- Appointments / visits
CREATE TABLE appointments (
    appointment_id  SERIAL PRIMARY KEY,
    client_id       INT NOT NULL REFERENCES clients(client_id),
    clinician_id    INT NOT NULL REFERENCES clinicians(clinician_id),
    facility_id     INT NOT NULL REFERENCES facilities(facility_id),
    claim_id        INT REFERENCES wsib_claims(claim_id),     -- NULL if not WSIB
    scheduled_at    TIMESTAMPTZ NOT NULL,
    duration_min    SMALLINT NOT NULL DEFAULT 60,
    visit_type      VARCHAR(20) NOT NULL DEFAULT 'in_home'
                    CHECK (visit_type IN ('in_home','clinic','telehealth','school','workplace')),
    status          VARCHAR(20) NOT NULL DEFAULT 'scheduled'
                    CHECK (status IN ('scheduled','completed','cancelled','no_show','late_cancel')),
    cancellation_reason VARCHAR(200),
    travel_km       NUMERIC(6,1),                             -- For mileage tracking
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Composite index for clinician utilization queries (the hot path)
CREATE INDEX idx_appts_clinician_date ON appointments(clinician_id, scheduled_at);
CREATE INDEX idx_appts_client_id ON appointments(client_id);
CREATE INDEX idx_appts_status ON appointments(status);
CREATE INDEX idx_appts_claim_id ON appointments(claim_id);
-- Partial index for upcoming appointments only (reduces AR aging query cost)
CREATE INDEX idx_appts_upcoming ON appointments(scheduled_at) WHERE status = 'scheduled';

COMMENT ON INDEX idx_appts_clinician_date IS 'Primary index for clinician utilization and billing reports';

-- Clinical notes (SOAP format)
CREATE TABLE clinical_notes (
    note_id             SERIAL PRIMARY KEY,
    appointment_id      INT NOT NULL UNIQUE REFERENCES appointments(appointment_id),
    clinician_id        INT NOT NULL REFERENCES clinicians(clinician_id),
    -- SOAP sections
    soap_subjective     TEXT,
    soap_objective      TEXT,
    soap_assessment     TEXT,
    soap_plan           TEXT,
    -- Dictation source
    raw_dictation       TEXT,               -- Original voice-to-text before AI structuring
    ai_structured       BOOLEAN NOT NULL DEFAULT FALSE,
    -- Signatures
    drafted_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    signed_at           TIMESTAMPTZ,        -- NULL until clinician reviews and signs
    signed_by           INT REFERENCES clinicians(clinician_id),
    -- Flags
    requires_review     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notes_clinician_id ON clinical_notes(clinician_id);
CREATE INDEX idx_notes_signed_at ON clinical_notes(signed_at);
-- Partial index for unsigned notes (clinician worklist)
CREATE INDEX idx_notes_unsigned ON clinical_notes(clinician_id, drafted_at)
    WHERE signed_at IS NULL;

COMMENT ON COLUMN clinical_notes.raw_dictation IS 'Original free-text/voice input before AI processing';
COMMENT ON COLUMN clinical_notes.ai_structured IS 'TRUE if SOAP sections were generated/structured by AI pipeline';
COMMENT ON COLUMN clinical_notes.signed_at IS 'NULL = draft/pending clinician review. Never submit to WSIB without signature.';

-- Progress reports (Form 8, Form 26, FAF)
CREATE TABLE progress_reports (
    report_id           SERIAL PRIMARY KEY,
    claim_id            INT NOT NULL REFERENCES wsib_claims(claim_id),
    clinician_id        INT NOT NULL REFERENCES clinicians(clinician_id),
    appointment_id      INT REFERENCES appointments(appointment_id),
    -- Report metadata
    report_type         VARCHAR(20) NOT NULL CHECK (report_type IN ('Form8','Form26','FAF','Continuity','Discharge')),
    form_data           JSONB NOT NULL DEFAULT '{}',   -- Stores all form fields as structured JSON
    -- RTW
    rtw_status          VARCHAR(30) CHECK (rtw_status IN ('regular_duties','modified_duties','unable_to_work','not_assessed')),
    rtw_date            DATE,
    -- Clinical
    prognosis           VARCHAR(100),
    change_since_last   VARCHAR(20) CHECK (change_since_last IN ('recovered','improving','unchanged','worsening')),
    -- Billing
    service_code        VARCHAR(10) REFERENCES service_codes(service_code),
    -- Workflow
    drafted_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    signed_at           TIMESTAMPTZ,
    signed_by           INT REFERENCES clinicians(clinician_id),
    submitted_at        TIMESTAMPTZ,
    submission_channel  VARCHAR(20) CHECK (submission_channel IN ('telus_eservices','paper','fax','portal')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_claim_id ON progress_reports(claim_id);
CREATE INDEX idx_reports_clinician_id ON progress_reports(clinician_id);
CREATE INDEX idx_reports_report_type ON progress_reports(report_type);
CREATE INDEX idx_reports_submitted_at ON progress_reports(submitted_at);
-- Partial index for unsubmitted reports
CREATE INDEX idx_reports_pending ON progress_reports(clinician_id, drafted_at)
    WHERE submitted_at IS NULL;

COMMENT ON COLUMN progress_reports.form_data IS 'Full WSIB form field values as JSONB — queryable and auditable';
COMMENT ON COLUMN progress_reports.signed_at IS 'Clinician e-signature timestamp — must be set before submitted_at can be populated.';
COMMENT ON COLUMN progress_reports.signed_by IS 'Clinician who signed the form — may differ from drafting clinician.';
COMMENT ON COLUMN progress_reports.submitted_at IS 'NULL = pending review. Never submit without clinician signature (signed_at must not be NULL).';

-- ============================================================
-- BILLING & INVOICING
-- ============================================================

-- Invoices (one per billing period per insurer per claim)
CREATE TABLE invoices (
    invoice_id      SERIAL PRIMARY KEY,
    claim_id        INT NOT NULL REFERENCES wsib_claims(claim_id),
    insurer_id      INT NOT NULL REFERENCES insurers(insurer_id),
    clinician_id    INT NOT NULL REFERENCES clinicians(clinician_id),
    invoice_number  VARCHAR(30) UNIQUE NOT NULL,    -- e.g. INV-2026-00042
    invoice_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    period_start    DATE,
    period_end      DATE,
    -- Amounts
    subtotal_cad    NUMERIC(10,2) NOT NULL DEFAULT 0,
    hst_cad         NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_cad       NUMERIC(10,2) NOT NULL DEFAULT 0,
    -- Status workflow
    status          VARCHAR(20) NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','submitted','paid','partially_paid','rejected','disputed')),
    submitted_at    TIMESTAMPTZ,
    paid_at         TIMESTAMPTZ,
    rejected_reason TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for AR aging analysis (the critical billing query)
CREATE INDEX idx_invoices_status_submitted ON invoices(status, submitted_at);
CREATE INDEX idx_invoices_insurer_id ON invoices(insurer_id);
CREATE INDEX idx_invoices_clinician_id ON invoices(clinician_id);
CREATE INDEX idx_invoices_claim_id ON invoices(claim_id);
CREATE INDEX idx_invoices_invoice_date ON invoices(invoice_date);

COMMENT ON INDEX idx_invoices_status_submitted IS 'Hot path for AR aging report — filters submitted but unpaid invoices';

-- Billing line items (one per service rendered)
CREATE TABLE billing_line_items (
    line_item_id    SERIAL PRIMARY KEY,
    invoice_id      INT NOT NULL REFERENCES invoices(invoice_id) ON DELETE CASCADE,
    appointment_id  INT REFERENCES appointments(appointment_id),
    service_code    VARCHAR(10) NOT NULL REFERENCES service_codes(service_code),
    service_date    DATE NOT NULL,
    units           SMALLINT NOT NULL DEFAULT 1,
    unit_fee_cad    NUMERIC(8,2) NOT NULL,
    hst_cad         NUMERIC(8,2) NOT NULL DEFAULT 0,
    line_total_cad  NUMERIC(8,2) GENERATED ALWAYS AS (units * unit_fee_cad + hst_cad) STORED,
    description     VARCHAR(200),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_line_items_invoice_id ON billing_line_items(invoice_id);
CREATE INDEX idx_line_items_service_code ON billing_line_items(service_code);
CREATE INDEX idx_line_items_service_date ON billing_line_items(service_date);

COMMENT ON COLUMN billing_line_items.line_total_cad IS 'Computed column: units × unit_fee + HST';

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clients_updated_at
    BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_wsib_claims_updated_at
    BEFORE UPDATE ON wsib_claims FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_treatment_plans_updated_at
    BEFORE UPDATE ON treatment_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_appointments_updated_at
    BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_clinical_notes_updated_at
    BEFORE UPDATE ON clinical_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_invoices_updated_at
    BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
