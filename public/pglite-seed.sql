-- ============================================================
-- pglite-seed.sql — In-Browser DB Explorer Schema + Seed Data
-- Combines migrations 001, 002, 003 for pglite (no backend needed)
-- ALL DATA IS SYNTHETIC — demo purposes only
-- ============================================================

-- ============================================================
-- SCHEMA
-- ============================================================

CREATE TABLE referral_sources (
    referral_source_id  SERIAL PRIMARY KEY,
    name                VARCHAR(120) NOT NULL,
    type                VARCHAR(40) NOT NULL,
    contact_name        VARCHAR(80),
    contact_phone       VARCHAR(20),
    contact_email       VARCHAR(100),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE insurers (
    insurer_id      SERIAL PRIMARY KEY,
    name            VARCHAR(120) NOT NULL,
    type            VARCHAR(30) NOT NULL,
    contact_phone   VARCHAR(20),
    contact_email   VARCHAR(100),
    billing_portal  VARCHAR(200),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE facilities (
    facility_id     SERIAL PRIMARY KEY,
    name            VARCHAR(120) NOT NULL,
    type            VARCHAR(30) NOT NULL,
    address         VARCHAR(200),
    city            VARCHAR(60),
    province        CHAR(2) NOT NULL DEFAULT 'ON',
    postal_code     VARCHAR(7),
    region          VARCHAR(50),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE service_codes (
    service_code    VARCHAR(10) PRIMARY KEY,
    description     VARCHAR(200) NOT NULL,
    fee_cad         NUMERIC(8,2) NOT NULL,
    discipline      VARCHAR(30),
    form_type       VARCHAR(20),
    effective_date  DATE NOT NULL DEFAULT '2026-01-01',
    notes           TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE clients (
    client_id           SERIAL PRIMARY KEY,
    first_name          VARCHAR(60) NOT NULL,
    last_name           VARCHAR(60) NOT NULL,
    date_of_birth       DATE,
    sex                 CHAR(1),
    preferred_language  CHAR(2) NOT NULL DEFAULT 'EN',
    phone               VARCHAR(20),
    email               VARCHAR(100),
    address             VARCHAR(200),
    city                VARCHAR(60),
    province            CHAR(2) NOT NULL DEFAULT 'ON',
    postal_code         VARCHAR(7),
    referral_source_id  INT REFERENCES referral_sources(referral_source_id),
    primary_funder      VARCHAR(30),
    intake_date         DATE NOT NULL DEFAULT CURRENT_DATE,
    discharge_date      DATE,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clients_last_name     ON clients(last_name);
CREATE INDEX idx_clients_primary_funder ON clients(primary_funder);

CREATE TABLE clinicians (
    clinician_id            SERIAL PRIMARY KEY,
    first_name              VARCHAR(60) NOT NULL,
    last_name               VARCHAR(60) NOT NULL,
    designation             VARCHAR(10) NOT NULL,
    college_registration_no VARCHAR(20),
    wsib_provider_id        VARCHAR(20),
    hst_number              VARCHAR(20),
    email                   VARCHAR(100),
    phone                   VARCHAR(20),
    region                  VARCHAR(50),
    hourly_cost             NUMERIC(8,2),
    is_active               BOOLEAN NOT NULL DEFAULT TRUE,
    hire_date               DATE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clinicians_designation ON clinicians(designation);
CREATE INDEX idx_clinicians_region      ON clinicians(region);

CREATE TABLE wsib_claims (
    claim_id            SERIAL PRIMARY KEY,
    client_id           INT NOT NULL REFERENCES clients(client_id),
    insurer_id          INT NOT NULL REFERENCES insurers(insurer_id),
    claim_number        VARCHAR(20) UNIQUE,
    date_of_incident    DATE NOT NULL,
    employer_name       VARCHAR(120),
    worker_occupation   VARCHAR(100),
    body_parts_affected VARCHAR(200),
    injury_type         VARCHAR(60),
    diagnosis           VARCHAR(200),
    poc_type            VARCHAR(50),
    status              VARCHAR(20) NOT NULL DEFAULT 'pending',
    form8_submitted_at  TIMESTAMPTZ,
    allowed_at          TIMESTAMPTZ,
    closed_at           TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wsib_claims_client_id ON wsib_claims(client_id);
CREATE INDEX idx_wsib_claims_status    ON wsib_claims(status);
CREATE INDEX idx_wsib_claims_insurer_id ON wsib_claims(insurer_id);

CREATE TABLE treatment_plans (
    plan_id         SERIAL PRIMARY KEY,
    claim_id        INT NOT NULL REFERENCES wsib_claims(claim_id),
    clinician_id    INT NOT NULL REFERENCES clinicians(clinician_id),
    goals           TEXT NOT NULL,
    frequency       VARCHAR(60),
    start_date      DATE NOT NULL,
    end_date        DATE,
    status          VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE appointments (
    appointment_id  SERIAL PRIMARY KEY,
    client_id       INT NOT NULL REFERENCES clients(client_id),
    clinician_id    INT NOT NULL REFERENCES clinicians(clinician_id),
    facility_id     INT NOT NULL REFERENCES facilities(facility_id),
    claim_id        INT REFERENCES wsib_claims(claim_id),
    scheduled_at    TIMESTAMPTZ NOT NULL,
    duration_min    SMALLINT NOT NULL DEFAULT 60,
    visit_type      VARCHAR(20) NOT NULL DEFAULT 'in_home',
    status          VARCHAR(20) NOT NULL DEFAULT 'scheduled',
    cancellation_reason VARCHAR(200),
    travel_km       NUMERIC(6,1),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appts_clinician_date ON appointments(clinician_id, scheduled_at);
CREATE INDEX idx_appts_client_id      ON appointments(client_id);
CREATE INDEX idx_appts_status         ON appointments(status);

CREATE TABLE clinical_notes (
    note_id             SERIAL PRIMARY KEY,
    appointment_id      INT NOT NULL UNIQUE REFERENCES appointments(appointment_id),
    clinician_id        INT NOT NULL REFERENCES clinicians(clinician_id),
    soap_subjective     TEXT,
    soap_objective      TEXT,
    soap_assessment     TEXT,
    soap_plan           TEXT,
    raw_dictation       TEXT,
    ai_structured       BOOLEAN NOT NULL DEFAULT FALSE,
    drafted_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    signed_at           TIMESTAMPTZ,
    signed_by           INT REFERENCES clinicians(clinician_id),
    requires_review     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notes_clinician_id ON clinical_notes(clinician_id);
CREATE INDEX idx_notes_signed_at    ON clinical_notes(signed_at);

CREATE TABLE progress_reports (
    report_id           SERIAL PRIMARY KEY,
    claim_id            INT NOT NULL REFERENCES wsib_claims(claim_id),
    clinician_id        INT NOT NULL REFERENCES clinicians(clinician_id),
    appointment_id      INT REFERENCES appointments(appointment_id),
    report_type         VARCHAR(20) NOT NULL,
    form_data           JSONB NOT NULL DEFAULT '{}',
    rtw_status          VARCHAR(30),
    rtw_date            DATE,
    prognosis           VARCHAR(100),
    change_since_last   VARCHAR(20),
    service_code        VARCHAR(10) REFERENCES service_codes(service_code),
    drafted_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    signed_at           TIMESTAMPTZ,
    signed_by           INT REFERENCES clinicians(clinician_id),
    submitted_at        TIMESTAMPTZ,
    submission_channel  VARCHAR(20),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_claim_id     ON progress_reports(claim_id);
CREATE INDEX idx_reports_report_type  ON progress_reports(report_type);
CREATE INDEX idx_reports_submitted_at ON progress_reports(submitted_at);

CREATE TABLE invoices (
    invoice_id      SERIAL PRIMARY KEY,
    claim_id        INT NOT NULL REFERENCES wsib_claims(claim_id),
    insurer_id      INT NOT NULL REFERENCES insurers(insurer_id),
    clinician_id    INT NOT NULL REFERENCES clinicians(clinician_id),
    invoice_number  VARCHAR(30) UNIQUE NOT NULL,
    invoice_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    period_start    DATE,
    period_end      DATE,
    subtotal_cad    NUMERIC(10,2) NOT NULL DEFAULT 0,
    hst_cad         NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_cad       NUMERIC(10,2) NOT NULL DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'draft',
    submitted_at    TIMESTAMPTZ,
    paid_at         TIMESTAMPTZ,
    rejected_reason TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_status_submitted ON invoices(status, submitted_at);
CREATE INDEX idx_invoices_insurer_id       ON invoices(insurer_id);
CREATE INDEX idx_invoices_clinician_id     ON invoices(clinician_id);
CREATE INDEX idx_invoices_claim_id         ON invoices(claim_id);

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

CREATE INDEX idx_line_items_invoice_id  ON billing_line_items(invoice_id);
CREATE INDEX idx_line_items_service_code ON billing_line_items(service_code);

-- updated_at trigger (pglite supports plpgsql)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clients_updated_at    BEFORE UPDATE ON clients    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_wsib_claims_updated_at BEFORE UPDATE ON wsib_claims FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_invoices_updated_at   BEFORE UPDATE ON invoices   FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SERVICE CODES + REFERENCE DATA (Migration 002)
-- ============================================================

INSERT INTO service_codes (service_code, description, fee_cad, discipline, form_type, notes) VALUES
('5100',  'OT — Clinic Visit',                        79.58,  'OT',  'Visit',  'Use 5101 for in-home visits'),
('5101',  'OT — Home/Community Visit',               159.14,  'OT',  'Visit',  'Higher rate reflects travel'),
('5130',  'OT — Acupuncture',                         52.31,  'OT',  'Visit',  'Cannot bill with 5100 same session'),
('P101',  'PT — Initial Assessment',                  74.25,  'PT',  'Visit',  NULL),
('P201',  'PT — Treatment Visit',                     62.40,  'PT',  'Visit',  NULL),
('P970',  'PT — Assessment Report',                   18.41,  'PT',  'Form',   NULL),
('8M',    'Form 8 — Paper',                           40.00,  'All', 'Form8',  'ONLY code on first visit. FAF not same day.'),
('8ME',   'Form 8 — Electronic',                      45.00,  'All', 'Form8',  'ONLY code on first visit. FAF not same day.'),
('26M',   'Form 26 — Paper',                          35.00,  'All', 'Form26', 'Always preprinted 26M — never 26 or 26E'),
('26ME',  'Form 26 — Electronic',                     40.00,  'All', 'Form26', NULL),
('FAF',   'Functional Abilities Form',                45.00,  'All', 'FAF',    'NOT billed same day as Form 8'),
('8R',    'Continuity Report',                        33.00,  'All', 'Form',   NULL),
('P651',  'Review of Records (per 15 min)',           56.05,  'All', 'Other',  NULL),
('ONHST', 'Ontario HST',                               0.00,  'All', 'Other',  '13% where applicable'),
('S100',  'SLP — Assessment',                         92.00,  'SLP', 'Visit',  NULL),
('S200',  'SLP — Treatment Visit',                    78.00,  'SLP', 'Visit',  NULL);

INSERT INTO insurers (name, type, contact_phone, billing_portal) VALUES
('WSIB Ontario',                 'wsib',     '1-800-387-0750', 'TELUS Health eServices'),
('Intact Insurance',             'auto',     '1-866-464-2424', 'Intact Provider Portal'),
('Aviva Canada',                 'auto',     '1-800-387-4518', 'Aviva Provider Portal'),
('Wawanesa Insurance',           'auto',     '1-800-263-6785', NULL),
('Manulife Financial',           'ehc',      '1-800-268-6195', 'Manulife Provider Portal'),
('Sun Life Financial',           'ehc',      '1-800-361-6212', 'Sun Life Provider Portal'),
('Great-West Life (Canada Life)','ehc',      '1-800-957-9777', 'Canada Life Provider Portal'),
('Self-Pay',                     'self_pay',  NULL,             NULL);

INSERT INTO referral_sources (name, type, contact_name) VALUES
('WSIB Ontario',                      'insurer',      'Case Adjudicator'),
('Intact Insurance Claims',           'insurer',      'Claims Department'),
('Aviva Auto Claims',                 'insurer',      'Claims Department'),
('Boland Howe LLP',                   'lawyer',       'Personal Injury Dept'),
('Thomson Rogers Lawyers',            'lawyer',       'MVA Claims'),
('Dr. Maria Reyes — Family Practice', 'physician',    'Dr. Maria Reyes'),
('North York General Hospital',       'hospital',     'Discharge Planner'),
('Sunnybrook Health Sciences',        'hospital',     'Rehab Coordinator'),
('Independent Case Managers Inc.',    'case_manager', 'ICM Team'),
('Self-Referral',                     'self',          NULL);

INSERT INTO facilities (name, type, address, city, region) VALUES
('Client Home — GTA',                'in_home',   NULL,                    NULL,         'GTA'),
('Client Home — Ottawa',             'in_home',   NULL,                    NULL,         'Ottawa'),
('Client Home — Niagara',            'in_home',   NULL,                    NULL,         'Niagara'),
('FunctionAbility — Concord Clinic', 'clinic',    '9135 Keele Street B5',  'Concord',    'GTA'),
('FunctionAbility — Ottawa Office',  'clinic',    NULL,                    'Ottawa',     'Ottawa'),
('North York General Hospital',      'hospital',  '4001 Leslie Street',    'North York', 'GTA'),
('Community Centre — Woodbridge',    'community', NULL,                    'Woodbridge', 'GTA'),
('Workplace Site — Mississauga',     'workplace', NULL,                    'Mississauga','GTA');

-- ============================================================
-- DEMO DATA (Migration 003)
-- ============================================================

INSERT INTO clinicians (first_name, last_name, designation, college_registration_no, wsib_provider_id, hst_number, email, region, hourly_cost, hire_date) VALUES
('Sarah',  'Mitchell',  'OT',  'CAOT-ON-44521',  'OT-ON-44521',  'HST-887234', 'sarah.mitchell@demo.rehabos.ca',  'GTA',     85.00, '2019-03-15'),
('James',  'Okafor',    'PT',  'CPO-ON-23187',   'PT-ON-23187',  'HST-662910', 'james.okafor@demo.rehabos.ca',    'GTA',     80.00, '2020-07-01'),
('Priya',  'Sharma',    'SLP', 'OSLA-ON-11099',  'SLP-ON-11099',  NULL,        'priya.sharma@demo.rehabos.ca',    'GTA',     90.00, '2021-01-10'),
('Wei',    'Chen',      'OT',  'CAOT-ON-55203',  'OT-ON-55203',   NULL,        'wei.chen@demo.rehabos.ca',        'Ottawa',  85.00, '2022-05-20'),
('Carlos', 'Reyes',     'PT',  'CPO-ON-78341',   'PT-ON-78341',   NULL,        'carlos.reyes@demo.rehabos.ca',    'Niagara', 80.00, '2021-09-06');

INSERT INTO clients (first_name, last_name, date_of_birth, sex, preferred_language, phone, address, city, province, postal_code, referral_source_id, primary_funder, intake_date) VALUES
('Alex',   'Thornton',   '1985-06-14', 'M', 'EN', '416-555-0101', '14 Birchwood Lane',      'Woodbridge',  'ON', 'L4L 1A1', 1, 'wsib', '2025-09-03'),
('Maria',  'Santos',     '1972-11-28', 'F', 'EN', '905-555-0202', '87 Rosewood Crescent',   'Mississauga', 'ON', 'L5G 2C4', 2, 'auto', '2025-10-15'),
('Robert', 'Nkemdirim',  '1990-03-07', 'M', 'EN', '416-555-0303', '321 Elm Street',         'North York',  'ON', 'M2N 3P8', 1, 'wsib', '2025-08-19'),
('Fatima', 'Al-Rashid',  '1968-09-22', 'F', 'EN', '647-555-0404', '56 Lakeview Drive',      'Etobicoke',   'ON', 'M9C 1K2', 5, 'wsib', '2025-11-01'),
('David',  'Kowalczyk',  '1979-04-11', 'M', 'EN', '905-555-0505', '12 Maple Ridge Road',    'Brampton',    'ON', 'L6W 4T3', 1, 'wsib', '2025-12-10'),
('Linda',  'Fernandez',  '1995-08-30', 'F', 'EN', '416-555-0606', '903 Queen Street West',  'Toronto',     'ON', 'M6J 1G5', 4, 'auto', '2026-01-22');

INSERT INTO wsib_claims (client_id, insurer_id, claim_number, date_of_incident, employer_name, worker_occupation, body_parts_affected, injury_type, diagnosis, poc_type, status, form8_submitted_at, allowed_at) VALUES
(1, 1, 'WSIB-2025-048291', '2025-08-27', 'Thornton Concrete Ltd',   'Construction Labourer',  'Head, Neck',          'Traumatic Brain Injury',     'S09.90 Post-concussion syndrome',          'Complex', 'allowed',       '2025-09-10 09:00:00+00', '2025-09-18 14:00:00+00'),
(2, 2, 'INTACT-2025-L88342','2025-10-08', NULL,                       NULL,                    'L Shoulder',          'Soft Tissue Injury',          'S40.012A Rotator cuff tear partial',       'MSK',     'allowed',       '2025-10-20 10:30:00+00', '2025-10-25 11:00:00+00'),
(3, 1, 'WSIB-2025-031174', '2025-08-01', 'Metro Logistics Inc',      'Warehouse Supervisor',  'Thoracic Spine, LE',  'Spinal Cord Injury',          'S24.102A T6 Complete ASIA A Paraplegia',   'Complex', 'allowed',       '2025-08-10 08:00:00+00', '2025-08-20 09:00:00+00'),
(4, 1, 'WSIB-2025-061009', '2025-10-22', 'City of Toronto',          'Administrative Officer','L UE, Cognitive',     'Cerebrovascular Accident',    'I63.9 Cerebral infarction L hemiparesis',  'Complex', 'under_review',  '2025-11-05 09:00:00+00', NULL),
(5, 1, 'WSIB-2025-079832', '2025-11-28', 'Ontario Auto Parts Ltd',   'Assembly Line Worker',  'Lumbar Spine',        'Repetitive Strain Injury',    'M54.5 Low back pain L4-L5',                'MSK',     'allowed',       '2025-12-15 10:00:00+00', '2025-12-20 14:00:00+00');

INSERT INTO treatment_plans (claim_id, clinician_id, goals, frequency, start_date, end_date, status) VALUES
(1, 1, 'Goal 1: Independent with 3-step ADL tasks with ≤2 verbal cues
Goal 2: Independent with medication management using compensatory strategies
Goal 3: Return to part-time volunteer work (4h/day) within 3 months', '1x/week x 12 weeks', '2025-09-15', '2025-12-15', 'active'),
(2, 2, 'Goal 1: L shoulder flexion to 170° (currently 120°)
Goal 2: Return to full overhead activities without pain
Goal 3: Resume driving within 4 weeks', '2x/week x 6 weeks', '2025-10-22', '2025-12-05', 'active'),
(3, 1, 'Goal 1: Independent wheelchair self-propulsion on community surfaces
Goal 2: Prevent pressure injury progression
Goal 3: Independent upper body dressing and grooming', '2x/month ongoing', '2025-08-25', NULL, 'active'),
(5, 1, 'Goal 1: Return to modified duties within 2 weeks
Goal 2: Return to full duties (unrestricted lifting) within 8 weeks
Goal 3: Implement ergonomic workplace modifications', '1x/week x 4 weeks then 1x/month', '2025-12-15', '2026-02-15', 'active');

INSERT INTO appointments (client_id, clinician_id, facility_id, claim_id, scheduled_at, duration_min, visit_type, status, travel_km) VALUES
(1, 1, 1, 1, '2025-09-15 10:00:00+00', 90, 'in_home', 'completed', 12.4),
(1, 1, 1, 1, '2025-09-22 10:00:00+00', 60, 'in_home', 'completed', 12.4),
(1, 1, 1, 1, '2025-10-06 10:00:00+00', 60, 'in_home', 'completed', 12.4),
(1, 1, 1, 1, '2026-06-10 10:00:00+00', 60, 'in_home', 'completed', 12.4),
(1, 1, 1, 1, '2026-06-24 10:00:00+00', 60, 'in_home', 'scheduled', 12.4),
(2, 2, 1, 2, '2025-10-22 14:00:00+00', 60, 'in_home', 'completed', 22.1),
(2, 2, 1, 2, '2025-10-29 14:00:00+00', 60, 'in_home', 'completed', 22.1),
(2, 2, 1, 2, '2025-11-05 14:00:00+00', 60, 'in_home', 'no_show',   22.1),
(2, 2, 1, 2, '2026-06-11 14:00:00+00', 60, 'in_home', 'completed', 22.1),
(3, 1, 1, 3, '2025-08-25 11:00:00+00', 90, 'in_home', 'completed',  8.3),
(3, 1, 1, 3, '2025-09-08 11:00:00+00', 90, 'in_home', 'completed',  8.3),
(5, 1, 4, 5, '2025-12-13 09:00:00+00', 120,'clinic',  'completed', NULL);

INSERT INTO clinical_notes (appointment_id, clinician_id, raw_dictation, soap_subjective, soap_objective, soap_assessment, soap_plan, ai_structured, drafted_at, signed_at, signed_by, requires_review) VALUES
(1, 1,
  'Saw Alex at his home on September 15th. He reports headaches four out of ten at rest, worse with concentration...',
  'Client reports headache 4/10 at rest, 7/10 with sustained concentration. Spouse notes increased irritability. Client states he can begin making coffee but forgets the steps mid-task. HEP not yet commenced (first visit).',
  'COGNISTAT: Memory 7/12, Attention 6/12, Judgment 8/12. 3-step breakfast task: required 7 verbal cues, completed in 52 min. Fatigue post-task 7/10. Grip: R 28 lbs / L 31 lbs (left-dominant). Intervention: initial assessment, HEP established, kitchen environmental assessment, visual cue cards designed.',
  'Moderate cognitive fatigue and executive function deficits consistent with post-concussion syndrome. Significant challenges with multi-step sequencing. Falls risk low. Prognosis guarded.',
  '1. Post visual cue cards in kitchen next visit
2. Begin backward chaining for meal preparation
3. Introduce energy conservation strategies
4. Frequency 1x/week x 12 weeks
5. Refer to neuropsychologist if no improvement by week 6
6. Complete WSIB Form 8 and submit electronically',
  TRUE, '2025-09-15 12:00:00+00', '2025-09-15 16:30:00+00', 1, FALSE),

(4, 1,
  'Saw Alex at home on June 10th. He reports headaches four out of ten, wife says more irritable...',
  'Client reports headache 4/10 at rest, 7/10 with concentration. Spouse reports increased irritability. Client states he can start coffee but forgets steps halfway. HEP compliance 3/7 days.',
  'COGNISTAT: Memory 7/12, Attention 6/12, Judgment 8/12. 3-step meal prep: 4 verbal cues (↓ from 7 — improved), completed in 34 min (↓ from 52 min). Fatigue 6/10. Grip: R 28 / L 31 lbs unchanged. Visual cue cards in use independently.',
  'Improving sequencing for familiar ADLs with reduced cueing. Persistent challenges with novel tasks and sustained attention. Goals 1 and 2 progressing; Goal 3 deferred pending cognitive endurance improvement.',
  '1. Introduce medication management — pill organizer + alarm strategy
2. Continue meal prep backward chaining — target ≤2 cues by end of month
3. Refer to psychology for fatigue management
4. Update treating physician re: cognitive status
5. HEP: add 10-min attention training (Lumosity) daily
6. Complete WSIB Form 26',
  TRUE, '2026-06-10 12:30:00+00', '2026-06-10 17:00:00+00', 1, FALSE),

(9, 2,
  'Home visit with Maria today June 11th. Left shoulder pain five out of ten rest, eight overhead...',
  'Client reports L shoulder pain 5/10 at rest, 8/10 overhead. Can reach second shelf but not above head. Still cannot sleep on L side. HEP compliance 5/7 days — technique correct.',
  'L shoulder AROM: Flexion 135° (↑ from 120°), Abduction 125°, ER 40°, IR 60°. PROM: Flexion 148°, Abduction 140°. MMT: Supraspinatus 3+/5, Infraspinatus 4-/5, Deltoid 4/5. Hawkins-Kennedy: Positive. Grip (R) 48 lbs. Intervention: US L supraspinatus, manual therapy glenohumeral capsule, progressive RTC strengthening.',
  'ROM improving consistently (+15° flexion over 3 sessions). Strength lagging behind ROM. No neural involvement. Impingement likely resolving.',
  '1. Progress Theraband to next resistance for ER/IR
2. Introduce eccentric loading for supraspinatus
3. Sleep position education: body pillow trial
4. Frequency 2x/week x 3 weeks then reassess
5. Complete WSIB Form 26 for Intact Insurance',
  TRUE, '2026-06-11 15:30:00+00', '2026-06-11 18:00:00+00', 2, FALSE),

(12, 1,
  'Functional capacity evaluation with David at our clinic on December 13th...',
  'Client reports low back pain 3/10 at rest, 7/10 with bending and lifting. No lower extremity radiation. Sits for ~20 min before needing to stand.',
  'Lumbar AROM: Flexion 65° (N:80°), Extension 15°, L lat flexion 20°, R 18°. SLR: negative bilaterally. Waddell signs 0/5. EPIC lift: 20 kg floor-to-knuckle, 15 kg knuckle-to-shoulder. Positional tolerance: sitting 18 min, standing 35 min. Employer has modified duties (light assembly, ≤10 kg, alternating sit-stand 30 min).',
  'Objective findings consistent with subjective complaints. Lift capacity (20 kg) matches modified assembly role requirements. Medically suitable for modified duties. Full duties not yet appropriate — target 8 weeks.',
  '1. RTW modified duties approved — start Monday December 16th
2. Restrictions: No lift >10 kg, no repetitive bending, alternating sit-stand q30 min
3. Complete WSIB Form 8 + FAF (separate billing dates)
4. Progressive home strengthening: McGill Big 3
5. Workplace ergonomic assessment within 2 weeks of RTW
6. Follow-up in 3 weeks to reassess for full duty progression',
  TRUE, '2025-12-13 11:00:00+00', '2025-12-13 14:00:00+00', 1, FALSE);

INSERT INTO progress_reports (claim_id, clinician_id, appointment_id, report_type, form_data, rtw_status, rtw_date, prognosis, change_since_last, service_code, drafted_at, signed_at, signed_by, submitted_at, submission_channel) VALUES
(1, 1, 1, 'Form8',
  '{"worker_first_name":"Alex","worker_last_name":"Thornton","date_of_incident":"2025-08-27","diagnosis":"S09.90 Post-concussion syndrome","rtw_status":"unable_to_work","service_code":"8ME","wsib_provider_id":"OT-ON-44521"}',
  'unable_to_work', NULL, 'full recovery not yet known', NULL,
  '8ME', '2025-09-15 16:00:00+00', '2025-09-15 16:00:00+00', 1, '2025-09-16 09:00:00+00', 'telus_eservices'),

(1, 1, 4, 'Form26',
  '{"worker_first_name":"Alex","worker_last_name":"Thornton","claim_number":"WSIB-2025-048291","rtw_status":"unable_to_work","change_since_last":"improving","prognosis":"partially recovered & improving","service_code":"26M","wsib_provider_id":"OT-ON-44521"}',
  'unable_to_work', NULL, 'partially recovered & improving', 'improving',
  '26M', '2026-06-10 17:30:00+00', NULL, NULL, NULL, NULL),

(5, 1, 12, 'Form8',
  '{"worker_first_name":"David","worker_last_name":"Kowalczyk","date_of_incident":"2025-11-28","diagnosis":"M54.5 Low back pain L4-L5","rtw_status":"modified_duties","rtw_date":"2025-12-16","service_code":"8ME","wsib_provider_id":"OT-ON-44521"}',
  'modified_duties', '2025-12-16', 'partially recovered, full recovery in ~8 weeks', NULL,
  '8ME', '2025-12-13 13:00:00+00', '2025-12-13 14:00:00+00', 1, '2025-12-13 16:00:00+00', 'telus_eservices');

INSERT INTO invoices (claim_id, insurer_id, clinician_id, invoice_number, invoice_date, period_start, period_end, subtotal_cad, hst_cad, total_cad, status, submitted_at, paid_at) VALUES
(1, 1, 1, 'INV-2025-00041', '2025-10-01', '2025-09-15', '2025-09-30', 477.48, 0.00, 477.48, 'paid',      '2025-10-02 09:00:00+00', '2025-10-22 14:00:00+00'),
(2, 2, 2, 'INV-2025-00052', '2025-11-01', '2025-10-22', '2025-10-31', 284.00, 36.92, 320.92,'paid',      '2025-11-03 09:00:00+00', '2025-11-28 10:00:00+00'),
(3, 1, 1, 'INV-2025-00038', '2025-09-15', '2025-08-25', '2025-09-12', 358.11, 0.00,  358.11,'submitted', '2025-09-16 09:00:00+00', NULL),
(1, 1, 1, 'INV-2026-00108', '2026-06-15', '2026-06-01', '2026-06-14', 318.32, 0.00,  318.32,'draft',     NULL,                     NULL),
(5, 1, 1, 'INV-2025-00091', '2025-12-20', '2025-12-13', '2025-12-13', 204.16, 0.00,  204.16,'submitted', '2025-12-20 10:00:00+00', NULL),
(5, 1, 1, 'INV-2025-00092', '2025-12-20', '2025-12-14', '2025-12-14',  45.00, 0.00,   45.00,'submitted', '2025-12-20 10:00:00+00', NULL);

INSERT INTO billing_line_items (invoice_id, appointment_id, service_code, service_date, units, unit_fee_cad, hst_cad, description) VALUES
(1, 1,  '5101', '2025-09-15', 1, 159.14, 0.00, 'OT in-home initial assessment — 90 min'),
(1, 1,  '8ME',  '2025-09-15', 1,  45.00, 0.00, 'WSIB Form 8 Electronic — TBI first report'),
(1, 2,  '5101', '2025-09-22', 1, 159.14, 0.00, 'OT in-home treatment — backward chaining ADL'),
(1, 3,  '5101', '2025-10-06', 1, 159.14, 0.00, 'OT in-home treatment — cognitive strategy training'),
(2, 6,  'P101', '2025-10-22', 1,  74.25, 9.65, 'PT in-home initial assessment — rotator cuff'),
(2, 7,  'P201', '2025-10-29', 1,  62.40, 8.11, 'PT in-home treatment — manual therapy + ultrasound'),
(3, 10, '5101', '2025-08-25', 1, 159.14, 0.00, 'OT in-home initial assessment — SCI T6 paraplegia'),
(3, 11, '5101', '2025-09-08', 1, 159.14, 0.00, 'OT in-home treatment — wheelchair seating + ADL'),
(4, 4,  '5101', '2026-06-10', 1, 159.14, 0.00, 'OT in-home treatment — cognitive ADL training'),
(4, 4,  '26M',  '2026-06-10', 1,  35.00, 0.00, 'WSIB Form 26 — progress report'),
(5, 12, '5100', '2025-12-13', 2,  79.58, 0.00, 'OT clinic FCE — 2 units (120 min)'),
(5, 12, '8ME',  '2025-12-13', 1,  45.00, 0.00, 'WSIB Form 8 Electronic — low back RSI first report'),
(6, 12, 'FAF',  '2025-12-14', 1,  45.00, 0.00, 'Functional Abilities Form — billed separately from Form 8');
