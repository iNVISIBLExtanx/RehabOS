-- ============================================================
-- Migration 002: Seed WSIB Service Codes & Reference Data
-- Source: WSIB fee schedules, 2.0% CPI increase Jan 1 2026
-- IMPORTANT: Verify current rates at wsib.ca before clinical use
-- ============================================================

-- ============================================================
-- WSIB SERVICE CODES
-- ============================================================
INSERT INTO service_codes (service_code, description, fee_cad, discipline, form_type, effective_date, notes) VALUES

-- OT Visit Codes
('5100',  'Occupational Therapy — Clinic Visit',
          79.58, 'OT', 'Visit', '2026-01-01',
          'Standard OT clinic visit. Use 5101 for in-home/community visits.'),

('5101',  'Occupational Therapy — Home/Community Visit',
          159.14, 'OT', 'Visit', '2026-01-01',
          'In-home or community setting. Higher rate reflects travel. FunctionAbility primary code.'),

('5130',  'Occupational Therapy — Acupuncture',
          52.31, 'OT', 'Visit', '2026-01-01',
          'Cannot be billed in same session as 5100. Bill 5130 OR 5100, not both.'),

-- PT Codes (for reference — PT clinicians at FA)
('P101',  'Physiotherapy — Assessment',
          74.25, 'PT', 'Visit', '2026-01-01',
          'Initial physiotherapy assessment. Generates Form 8.'),

('P201',  'Physiotherapy — Treatment Visit',
          62.40, 'PT', 'Visit', '2026-01-01',
          'Subsequent PT treatment visit.'),

('P970',  'Physiotherapy Assessment Report',
          18.41, 'PT', 'Form', '2026-01-01',
          'Written report. Separate from treatment visit code.'),

-- Form 8 — First Report
('8M',    'Health Professional First Report — Paper (Form 8)',
          40.00, 'All', 'Form8', '2026-01-01',
          'Paper submission. RULE: Only Form 8 is paid on first visit. FAF cannot be same day.'),

('8ME',   'Health Professional First Report — Electronic (Form 8)',
          45.00, 'All', 'Form8', '2026-01-01',
          'Electronic submission via TELUS Health eServices. Preferred — faster payment.'),

-- Form 26 — Progress Report
('26M',   'Health Professional Progress Report — Paper (Form 26)',
          35.00, 'All', 'Form26', '2026-01-01',
          'Preprinted on Form 0896A. Fee is illustrative — verify at wsib.ca.'),

('26ME',  'Health Professional Progress Report — Electronic (Form 26)',
          40.00, 'All', 'Form26', '2026-01-01',
          'Electronic progress report. Verify fee at wsib.ca.'),

-- Functional Abilities Form
('FAF',   'Functional Abilities Form',
          45.00, 'All', 'FAF', '2026-01-01',
          'Form 2647A. RULE: NOT paid on same day as Form 8 (8M or 8ME).'),

-- Continuity Report
('8R',    'Health Professional Continuity Report',
          33.00, 'All', 'Form', '2026-01-01',
          'Used when care continues beyond initial plan.'),

-- Record Review
('P651',  'Review of Records',
          56.05, 'All', 'Other', '2026-01-01',
          'Per 15-minute unit for record review and reporting.'),

-- HST line item
('ONHST', 'Ontario HST',
          0.00, 'All', 'Other', '2026-01-01',
          'HST billed as separate line item where applicable. Rate: 13%.'),

-- SLP codes
('S100',  'Speech-Language Pathology — Assessment',
          92.00, 'SLP', 'Visit', '2026-01-01',
          'Initial SLP assessment. Indicative rate — verify current schedule.'),

('S200',  'Speech-Language Pathology — Treatment Visit',
          78.00, 'SLP', 'Visit', '2026-01-01',
          'SLP treatment session. Indicative rate — verify current schedule.');

-- ============================================================
-- REFERENCE DATA: INSURERS
-- ============================================================
INSERT INTO insurers (name, type, contact_phone, billing_portal) VALUES
('WSIB Ontario',                'wsib',    '1-800-387-0750', 'TELUS Health eServices'),
('Intact Insurance',            'auto',    '1-866-464-2424', 'Intact Provider Portal'),
('Aviva Canada',                'auto',    '1-800-387-4518', 'Aviva Provider Portal'),
('Wawanesa Insurance',          'auto',    '1-800-263-6785', NULL),
('Manulife Financial',          'ehc',     '1-800-268-6195', 'Manulife Provider Portal'),
('Sun Life Financial',          'ehc',     '1-800-361-6212', 'Sun Life Provider Portal'),
('Great-West Life (Canada Life)','ehc',    '1-800-957-9777', 'Canada Life Provider Portal'),
('Self-Pay',                    'self_pay', NULL,             NULL);

-- ============================================================
-- REFERENCE DATA: REFERRAL SOURCES
-- ============================================================
INSERT INTO referral_sources (name, type, contact_name) VALUES
('WSIB Ontario',                    'insurer',      'Case Adjudicator'),
('Intact Insurance Claims',         'insurer',      'Claims Department'),
('Aviva Auto Claims',               'insurer',      'Claims Department'),
('Boland Howe LLP',                 'lawyer',       'Personal Injury Dept'),
('Thomson Rogers Lawyers',          'lawyer',       'MVA Claims'),
('Dr. Maria Reyes — Family Practice','physician',   'Dr. Maria Reyes'),
('North York General Hospital',     'hospital',     'Discharge Planner'),
('Sunnybrook Health Sciences',      'hospital',     'Rehab Coordinator'),
('Independent Case Managers Inc.',  'case_manager', 'ICM Team'),
('Self-Referral',                   'self',         NULL);

-- ============================================================
-- REFERENCE DATA: FACILITIES
-- ============================================================
INSERT INTO facilities (name, type, address, city, region) VALUES
('Client Home — GTA',       'in_home',   NULL, NULL, 'GTA'),
('Client Home — Ottawa',    'in_home',   NULL, NULL, 'Ottawa'),
('Client Home — Niagara',   'in_home',   NULL, NULL, 'Niagara'),
('FunctionAbility — Concord Clinic', 'clinic',
          '9135 Keele Street Unit B5', 'Concord', 'GTA'),
('FunctionAbility — Ottawa Office', 'clinic',
          NULL, 'Ottawa', 'Ottawa'),
('North York General Hospital', 'hospital',
          '4001 Leslie Street', 'North York', 'GTA'),
('Community Centre — Woodbridge', 'community',
          NULL, 'Woodbridge', 'GTA'),
('Workplace Site — Mississauga', 'workplace',
          NULL, 'Mississauga', 'GTA');
