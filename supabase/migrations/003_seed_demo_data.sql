-- ============================================================
-- Migration 003: Synthetic Demo Data
-- ⚠️  ALL NAMES, CLAIM NUMBERS, AND PERSONAL DETAILS ARE FICTITIOUS
-- ⚠️  FOR DEMONSTRATION PURPOSES ONLY — NOT REAL PATIENT DATA
-- ============================================================

-- ============================================================
-- CLINICIANS (synthetic staff)
-- ============================================================
INSERT INTO clinicians
    (first_name, last_name, designation, college_registration_no,
     wsib_provider_id, hst_number, email, region, hourly_cost, hire_date)
VALUES
('Sarah',   'Mitchell', 'OT',  'CAOT-ON-44521', 'OT-ON-44521', 'HST-887234',
  'sarah.mitchell@demo.rehabos.ca', 'GTA',    85.00, '2019-03-15'),
('James',   'Okafor',   'PT',  'CPO-ON-23187',  'PT-ON-23187', 'HST-662910',
  'james.okafor@demo.rehabos.ca',   'GTA',    80.00, '2020-07-01'),
('Priya',   'Sharma',   'SLP', 'OSLA-ON-11099', 'SLP-ON-11099', NULL,
  'priya.sharma@demo.rehabos.ca',   'GTA',    90.00, '2021-01-10'),
('Wei',     'Chen',     'OT',  'CAOT-ON-55203', 'OT-ON-55203', NULL,
  'wei.chen@demo.rehabos.ca',       'Ottawa', 85.00, '2022-05-20'),
('Carlos',  'Reyes',    'PT',  'CPO-ON-78341',  'PT-ON-78341', NULL,
  'carlos.reyes@demo.rehabos.ca',   'Niagara',80.00, '2021-09-06');

-- ============================================================
-- CLIENTS (synthetic — clearly fictitious names)
-- ============================================================
INSERT INTO clients
    (first_name, last_name, date_of_birth, sex, preferred_language,
     phone, address, city, province, postal_code,
     referral_source_id, primary_funder, intake_date)
VALUES
-- Client 1: TBI case (WSIB)
('Alex',    'Thornton', '1985-06-14', 'M', 'EN',
  '416-555-0101', '14 Birchwood Lane', 'Woodbridge', 'ON', 'L4L 1A1',
  1, 'wsib', '2025-09-03'),

-- Client 2: Rotator cuff MVA (auto insurer)
('Maria',   'Santos',   '1972-11-28', 'F', 'EN',
  '905-555-0202', '87 Rosewood Crescent', 'Mississauga', 'ON', 'L5G 2C4',
  2, 'auto', '2025-10-15'),

-- Client 3: SCI / paraplegia (WSIB)
('Robert',  'Nkemdirim','1990-03-07', 'M', 'EN',
  '416-555-0303', '321 Elm Street', 'North York', 'ON', 'M2N 3P8',
  1, 'wsib', '2025-08-19'),

-- Client 4: CVA / stroke (private EHC + WSIB)
('Fatima',  'Al-Rashid','1968-09-22', 'F', 'EN',
  '647-555-0404', '56 Lakeview Drive', 'Etobicoke', 'ON', 'M9C 1K2',
  5, 'wsib', '2025-11-01'),

-- Client 5: Low back RSI — RTW case (WSIB)
('David',   'Kowalczyk','1979-04-11', 'M', 'EN',
  '905-555-0505', '12 Maple Ridge Road', 'Brampton', 'ON', 'L6W 4T3',
  1, 'wsib', '2025-12-10'),

-- Client 6: Flexor tendon hand injury (auto)
('Linda',   'Fernandez', '1995-08-30', 'F', 'EN',
  '416-555-0606', '903 Queen Street West', 'Toronto', 'ON', 'M6J 1G5',
  4, 'auto', '2026-01-22');

-- ============================================================
-- WSIB CLAIMS
-- ============================================================
INSERT INTO wsib_claims
    (client_id, insurer_id, claim_number, date_of_incident,
     employer_name, worker_occupation, body_parts_affected,
     injury_type, diagnosis, poc_type, status, form8_submitted_at, allowed_at)
VALUES
-- Claim 1: Alex Thornton — TBI (workplace fall)
(1, 1, 'WSIB-2025-048291', '2025-08-27',
  'Thornton Concrete Ltd', 'Construction Labourer',
  'Head, Neck', 'Traumatic Brain Injury',
  'S09.90 — Unspecified injury of head; Post-concussion syndrome',
  'Complex', 'allowed',
  '2025-09-10 09:00:00+00', '2025-09-18 14:00:00+00'),

-- Claim 2: Maria Santos — Rotator cuff (not WSIB — auto insurer)
(2, 2, 'INTACT-2025-L88342', '2025-10-08',
  NULL, NULL,
  'L Shoulder', 'Soft Tissue Injury',
  'S40.012A — Contusion of left shoulder; Rotator cuff tear partial',
  'MSK', 'allowed',
  '2025-10-20 10:30:00+00', '2025-10-25 11:00:00+00'),

-- Claim 3: Robert Nkemdirim — SCI T6 complete (WSIB)
(3, 1, 'WSIB-2025-031174', '2025-08-01',
  'Metro Logistics Inc', 'Warehouse Supervisor',
  'Thoracic Spine, Bilateral LE', 'Spinal Cord Injury',
  'S24.102A — T6 Complete ASIA A Paraplegia',
  'Complex', 'allowed',
  '2025-08-10 08:00:00+00', '2025-08-20 09:00:00+00'),

-- Claim 4: Fatima Al-Rashid — CVA (WSIB — workplace stress related)
(4, 1, 'WSIB-2025-061009', '2025-10-22',
  'City of Toronto', 'Administrative Officer',
  'L UE, Cognitive', 'Cerebrovascular Accident',
  'I63.9 — Cerebral infarction, unspecified; L hemiparesis',
  'Complex', 'under_review',
  '2025-11-05 09:00:00+00', NULL),

-- Claim 5: David Kowalczyk — Low back RSI (WSIB)
(5, 1, 'WSIB-2025-079832', '2025-11-28',
  'Ontario Auto Parts Ltd', 'Assembly Line Worker',
  'Lumbar Spine', 'Repetitive Strain Injury',
  'M54.5 — Low back pain; Lumbar disc derangement L4-L5',
  'MSK', 'allowed',
  '2025-12-15 10:00:00+00', '2025-12-20 14:00:00+00');

-- ============================================================
-- TREATMENT PLANS
-- ============================================================
INSERT INTO treatment_plans
    (claim_id, clinician_id, goals, frequency, start_date, end_date, status)
VALUES
-- Alex Thornton — OT TBI plan
(1, 1,
  E'Goal 1: Independent with 3-step ADL tasks (meal prep) with ≤2 verbal cues\n'
  'Goal 2: Independent with medication management using compensatory strategies\n'
  'Goal 3: Return to part-time volunteer work (4h/day) within 3 months',
  '1x/week x 12 weeks', '2025-09-15', '2025-12-15', 'active'),

-- Maria Santos — PT rotator cuff plan
(2, 2,
  E'Goal 1: L shoulder flexion to 170° (currently 120°)\n'
  'Goal 2: Return to full overhead activities without pain\n'
  'Goal 3: Resume driving within 4 weeks',
  '2x/week x 6 weeks', '2025-10-22', '2025-12-05', 'active'),

-- Robert Nkemdirim — OT SCI plan
(3, 1,
  E'Goal 1: Independent with self-propulsion manual wheelchair on community surfaces\n'
  'Goal 2: Prevent stage 2 pressure injury progression — achieve Stage 1\n'
  'Goal 3: Independent upper body dressing and grooming',
  '2x/month x ongoing', '2025-08-25', NULL, 'active'),

-- David Kowalczyk — OT RTW functional assessment plan
(5, 1,
  E'Goal 1: Return to modified duties within 2 weeks\n'
  'Goal 2: Return to full duties (unrestricted lifting) within 8 weeks\n'
  'Goal 3: Implement ergonomic workplace modifications',
  '1x/week x 4 weeks then 1x/month', '2025-12-15', '2026-02-15', 'active');

-- ============================================================
-- APPOINTMENTS (12 appointments across 6 clients)
-- ============================================================
INSERT INTO appointments
    (client_id, clinician_id, facility_id, claim_id,
     scheduled_at, duration_min, visit_type, status, travel_km)
VALUES
-- Alex Thornton appointments (OT Sarah Mitchell, in-home GTA)
(1, 1, 1, 1, '2025-09-15 10:00:00+00', 90, 'in_home', 'completed', 12.4),
(1, 1, 1, 1, '2025-09-22 10:00:00+00', 60, 'in_home', 'completed', 12.4),
(1, 1, 1, 1, '2025-10-06 10:00:00+00', 60, 'in_home', 'completed', 12.4),
(1, 1, 1, 1, '2026-06-10 10:00:00+00', 60, 'in_home', 'completed', 12.4),
(1, 1, 1, 1, '2026-06-24 10:00:00+00', 60, 'in_home', 'scheduled',  12.4),

-- Maria Santos appointments (PT James Okafor, in-home Mississauga)
(2, 2, 1, 2, '2025-10-22 14:00:00+00', 60, 'in_home', 'completed', 22.1),
(2, 2, 1, 2, '2025-10-29 14:00:00+00', 60, 'in_home', 'completed', 22.1),
(2, 2, 1, 2, '2025-11-05 14:00:00+00', 60, 'in_home', 'no_show',   22.1),
(2, 2, 1, 2, '2026-06-11 14:00:00+00', 60, 'in_home', 'completed', 22.1),

-- Robert Nkemdirim (OT Sarah Mitchell, in-home North York)
(3, 1, 1, 3, '2025-08-25 11:00:00+00', 90, 'in_home', 'completed', 8.3),
(3, 1, 1, 3, '2025-09-08 11:00:00+00', 90, 'in_home', 'completed', 8.3),

-- David Kowalczyk (OT Sarah Mitchell, clinic)
(5, 1, 4, 5, '2025-12-13 09:00:00+00', 120, 'clinic', 'completed', NULL);

-- ============================================================
-- CLINICAL NOTES (SOAP format, AI-structured from dictations)
-- ============================================================
INSERT INTO clinical_notes
    (appointment_id, clinician_id,
     raw_dictation, soap_subjective, soap_objective, soap_assessment, soap_plan,
     ai_structured, drafted_at, signed_at, signed_by, requires_review)
VALUES
-- Note 1: Alex Thornton initial OT assessment (Appt 1)
(1, 1,
  'Saw Alex at his home on September 15th. He reports headaches four out of ten at rest, worse with concentration...',
  'Client reports headache 4/10 at rest, 7/10 with sustained concentration. Spouse notes increased irritability and difficulty initiating ADLs in the morning. Client states he can begin making coffee but forgets the steps mid-task. HEP exercises not yet commenced (first visit).',
  'COGNISTAT administered: Memory 7/12, Attention 6/12, Judgment 8/12. 3-step breakfast task (eggs on toast): required 7 verbal cues; completed in 52 min. Fatigue post-task: 7/10. Dynamic balance on kitchen mat: steady, no loss of balance. Grip strength (Jamar dynamometer): R 28 lbs / L 31 lbs (left-dominant). Intervention: completed initial assessment and established HEP. Environmental assessment of kitchen completed. Visual cue cards designed (to be printed).',
  'Client presents with moderate cognitive fatigue and executive function deficits consistent with post-concussion syndrome following TBI. Significant challenges with multi-step sequencing and sustained attention are impacting ADL independence and safety. Falls risk is low. Prognosis is guarded — TBI recovery is non-linear; expect improvement with consistent intervention.',
  E'1. Post visual cue cards in kitchen — bring printed copies next visit\n'
  '2. Begin backward chaining for meal preparation\n'
  '3. Introduce energy conservation strategies\n'
  '4. Frequency: 1x/week x 12 weeks\n'
  '5. Refer to neuropsychologist if no significant improvement by week 6\n'
  '6. Complete WSIB Form 8 and submit electronically',
  TRUE, '2025-09-15 12:00:00+00', '2025-09-15 16:30:00+00', 1, FALSE),

-- Note 2: Alex Thornton follow-up (Appt 4 — recent)
(4, 1,
  'Saw Alex at home on June 10th. He reports headaches four out of ten, wife says more irritable. Three step task took 34 minutes and needed 4 cues. HEP compliance three out of seven days...',
  'Client reports headache 4/10 at rest, 7/10 with concentration. Spouse reports increased irritability. Client states he can start coffee but forgets steps halfway. HEP compliance 3/7 days this week.',
  'COGNISTAT: Memory 7/12, Attention 6/12, Judgment 8/12. 3-step meal prep (eggs on toast): 4 verbal cues (↓ from 7 at initial — improved); completed in 34 min (↓ from 52 min — improved). Fatigue post-task: 6/10. Grip: R 28 lbs / L 31 lbs (unchanged). Visual cue cards in place — client using them independently. Intervention: strategy training backward chaining, energy conservation review, environmental modification check.',
  'Client demonstrates improving sequencing for familiar multi-step ADLs with reduced cueing (7→4 cues). ROM and strength stable. Persistent challenges with novel multi-step tasks and sustained attention. Fatigue remains a significant barrier. Goals 1 and 2 progressing on trajectory; Goal 3 (return to volunteer work) deferred pending cognitive endurance improvement.',
  E'1. Introduce medication management routine — pill organizer + alarm strategy\n'
  '2. Continue meal prep backward chaining — target ≤2 cues by end of month\n'
  '3. Refer to psychology for fatigue management\n'
  '4. Update treating physician re: cognitive status\n'
  '5. HEP: add 10-min attention training game (Lumosity) daily\n'
  '6. Complete WSIB Form 26 — due this billing period',
  TRUE, '2026-06-10 12:30:00+00', '2026-06-10 17:00:00+00', 1, FALSE),

-- Note 3: Maria Santos PT follow-up (Appt 9 — recent)
(9, 2,
  'Home visit with Maria today June 11th. Left shoulder pain five out of ten rest, eight overhead. Can reach second shelf but not above head...',
  'Client reports L shoulder pain 5/10 at rest, 8/10 overhead activity. Can reach second shelf but not above head. Still cannot sleep on L side. HEP compliance 5/7 days — technique observed and correct.',
  'L shoulder AROM: Flexion 135° (↑ from 120° last visit), Abduction 125°, ER 40°, IR 60°. PROM: Flexion 148°, Abduction 140° — end feel slightly firm. MMT: Supraspinatus 3+/5, Infraspinatus 4-/5, Deltoid 4/5. Hawkins-Kennedy: Positive (pain reproduced at 110° flex + IR). Grip (unaffected R): 48 lbs. Intervention: Therapeutic US L supraspinatus (1 MHz, 1.2 W/cm², 5 min), manual therapy glenohumeral posterior capsule, progressive RTC strengthening Theraband.',
  'ROM improving consistently (+15° flexion over 3 sessions). Strength lagging behind ROM; supraspinatus significantly weak. No neural involvement. Impingement likely resolving with conservative treatment. Reassess for specialist referral at 6-week mark if MMT does not reach 4/5.',
  E'1. Progress Theraband to next resistance level for ER/IR\n'
  '2. Introduce eccentric loading for supraspinatus (scaption 0.5 lb)\n'
  '3. Sleep position education: body pillow trial for R-side positioning\n'
  '4. Frequency: 2x/week x 3 weeks then reassess\n'
  '5. Complete WSIB Form 26 for Intact Insurance claim',
  TRUE, '2026-06-11 15:30:00+00', '2026-06-11 18:00:00+00', 2, FALSE),

-- Note 4: David Kowalczyk FCE (Appt 12)
(12, 1,
  'Functional capacity evaluation with David at our clinic on December 13th. Low back RSI from repetitive lifting...',
  'Client reports low back pain 3/10 at rest, 7/10 with bending and lifting. No lower extremity radiation or paraesthesia. States he can sit for about 20 minutes before needing to stand.',
  'Lumbar AROM: Flexion 65° (N: 80°), Extension 15° (N: 25°), L lat flexion 20°, R lat flexion 18°. SLR: negative bilaterally. Waddell signs: 0/5 (no non-organic signs). EPIC lift capacity test: safely lifted 20 kg floor-to-knuckle; 15 kg knuckle-to-shoulder. Positional tolerance: sitting 18 min, standing 35 min. Employer has modified duties program (light assembly, ≤10 kg lift, alternating sit-stand 30 min).',
  'Objective findings consistent with reported subjective complaints (no magnification). Lift capacity (20 kg floor-knuckle) is consistent with modified assembly role requirements (≤10 kg). Client is medically suitable for modified duties as described by employer. Full duties (unrestricted lifting) not yet appropriate — target 8 weeks with progressive strengthening.',
  E'1. RTW modified duties approved — start Monday December 16th\n'
  '2. Restrictions: No lift >10 kg, no repetitive bending, alternating sit-stand q30 min\n'
  '3. Complete WSIB Form 8 + Functional Abilities Form today\n'
  '4. Progressive home strengthening: McGill Big 3 program\n'
  '5. Workplace ergonomic assessment within 2 weeks of RTW\n'
  '6. Follow-up in 3 weeks to reassess for full duty progression',
  TRUE, '2025-12-13 11:00:00+00', '2025-12-13 14:00:00+00', 1, FALSE);

-- ============================================================
-- PROGRESS REPORTS
-- ============================================================
INSERT INTO progress_reports
    (claim_id, clinician_id, appointment_id, report_type,
     form_data, rtw_status, rtw_date, prognosis, change_since_last,
     service_code, drafted_at, submitted_at, submission_channel)
VALUES
-- Form 8 for Alex Thornton (TBI)
(1, 1, 1, 'Form8',
  '{
    "worker_first_name": "Alex", "worker_last_name": "Thornton",
    "worker_dob": "1985-06-14", "sex": "M",
    "date_of_incident": "2025-08-27",
    "how_injury_occurred": "Client sustained head injury after fall from scaffolding at construction site. Was not wearing hard hat. Lost consciousness briefly. Transported to hospital.",
    "worker_occupation": "Construction Labourer",
    "employer_name": "Thornton Concrete Ltd",
    "body_area": ["head", "neck"],
    "injury_type": ["TBI"],
    "diagnosis": "S09.90 Post-concussion syndrome",
    "pain_at_rest": 4, "pain_with_activity": 7, "pain_at_night": true,
    "treatment_type": "OT",
    "treatment_duration": "1x/week x 12 weeks",
    "investigations": [],
    "referrals": ["neuropsychologist"],
    "rtw_discussed": true,
    "rtw_status": "unable_to_work",
    "functional_abilities": {
      "bend_twist": "not_able", "climb": "not_able", "kneel": "able",
      "lift": "some", "operate_motor_vehicle": "not_able",
      "push_pull": "some", "sit": "able", "stand": "able",
      "use_upper_extremities": "full", "walk": "able"
    },
    "limitations_duration": "14+",
    "service_code": "8ME", "wsib_provider_id": "OT-ON-44521"
  }',
  'unable_to_work', NULL,
  'full recovery not yet known', NULL,
  '8ME', '2025-09-15 16:00:00+00', '2025-09-16 09:00:00+00', 'telus_eservices'),

-- Form 26 for Alex Thornton (progress report — recent visit)
(1, 1, 4, 'Form26',
  '{
    "worker_first_name": "Alex", "worker_last_name": "Thornton",
    "claim_number": "WSIB-2025-048291",
    "date_of_incident": "2025-08-27",
    "rtw_status": "unable_to_work",
    "rtw_date": null,
    "functional_abilities": {
      "bend_twist": "some", "climb": "not_able", "kneel": "able",
      "lift": "some", "operate_motor_vehicle": "not_able",
      "push_pull": "some", "sit": "full", "stand": "full",
      "use_upper_extremities": "full", "walk": "full"
    },
    "additional_comments": "Client remains unable to drive due to cognitive fatigue and processing speed deficits. Sustained attention limits work capacity to <2h before requiring rest.",
    "change_since_last": "improving",
    "current_diagnosis": "Post-concussion syndrome with cognitive fatigue and executive function deficits",
    "pre_existing_factors": "None identified",
    "prognosis": "partially recovered & improving",
    "current_treatment_plan": "Weekly OT in-home: backward chaining for ADL retraining, cognitive strategy training, energy conservation, environmental modification. Psychology referral initiated.",
    "service_code": "26M", "wsib_provider_id": "OT-ON-44521"
  }',
  'unable_to_work', NULL,
  'partially recovered & improving', 'improving',
  '26M', '2026-06-10 17:30:00+00', NULL, NULL),

-- Form 8 for David Kowalczyk (RTW — submitted same day)
(5, 1, 12, 'Form8',
  '{
    "worker_first_name": "David", "worker_last_name": "Kowalczyk",
    "date_of_incident": "2025-11-28",
    "how_injury_occurred": "Progressive low back pain from repetitive bending and lifting on assembly line. Onset insidious over 6 months, acute exacerbation November 28th.",
    "worker_occupation": "Assembly Line Worker",
    "employer_name": "Ontario Auto Parts Ltd",
    "body_area": ["back"],
    "injury_type": ["RSI"],
    "diagnosis": "M54.5 Low back pain; L4-L5 disc derangement",
    "pain_at_rest": 3, "pain_with_activity": 7, "pain_at_night": false,
    "treatment_type": "OT",
    "treatment_duration": "1x/week x 4 weeks",
    "rtw_discussed": true,
    "rtw_status": "modified_duties",
    "rtw_date": "2025-12-16",
    "functional_abilities": {
      "bend_twist": "not_able", "climb": "some", "kneel": "some",
      "lift": "some", "operate_motor_vehicle": "able",
      "push_pull": "some", "sit": "some", "stand": "some",
      "use_upper_extremities": "full", "walk": "full"
    },
    "additional_comments": "Maximum lift 10 kg. Alternating sit-stand every 30 minutes required. No repetitive bending.",
    "limitations_duration": "8-14",
    "service_code": "8ME", "wsib_provider_id": "OT-ON-44521"
  }',
  'modified_duties', '2025-12-16',
  'partially recovered, full recovery in ~8 weeks', NULL,
  '8ME', '2025-12-13 13:00:00+00', '2025-12-13 16:00:00+00', 'telus_eservices');

-- ============================================================
-- INVOICES
-- ============================================================
INSERT INTO invoices
    (claim_id, insurer_id, clinician_id, invoice_number, invoice_date,
     period_start, period_end, subtotal_cad, hst_cad, total_cad, status,
     submitted_at, paid_at)
VALUES
-- Invoice 1: Alex Thornton — initial OT visits (paid)
(1, 1, 1, 'INV-2025-00041', '2025-10-01',
  '2025-09-15', '2025-09-30',
  477.48, 0.00, 477.48, 'paid',
  '2025-10-02 09:00:00+00', '2025-10-22 14:00:00+00'),

-- Invoice 2: Maria Santos — PT initial visits (paid)
(2, 2, 2, 'INV-2025-00052', '2025-11-01',
  '2025-10-22', '2025-10-31',
  284.00, 36.92, 320.92, 'paid',
  '2025-11-03 09:00:00+00', '2025-11-28 10:00:00+00'),

-- Invoice 3: Robert Nkemdirim — OT SCI visits (submitted, awaiting payment)
(3, 1, 1, 'INV-2025-00038', '2025-09-15',
  '2025-08-25', '2025-09-12',
  358.11, 0.00, 358.11, 'submitted',
  '2025-09-16 09:00:00+00', NULL),

-- Invoice 4: Alex Thornton — recent visits (draft)
(1, 1, 1, 'INV-2026-00108', '2026-06-15',
  '2026-06-01', '2026-06-14',
  318.32, 0.00, 318.32, 'draft',
  NULL, NULL),

-- Invoice 5: David Kowalczyk — FCE + Form 8 (submitted)
(5, 1, 1, 'INV-2025-00091', '2025-12-20',
  '2025-12-13', '2025-12-13',
  204.58, 0.00, 204.58, 'submitted',
  '2025-12-20 10:00:00+00', NULL);

-- ============================================================
-- BILLING LINE ITEMS
-- ============================================================
INSERT INTO billing_line_items
    (invoice_id, appointment_id, service_code, service_date,
     units, unit_fee_cad, hst_cad, description)
VALUES
-- Invoice 1 line items: Alex Thornton Sept visits
(1, 1, '5101', '2025-09-15', 1, 159.14, 0.00, 'OT in-home initial assessment — 90 min'),
(1, 1, '8ME',  '2025-09-15', 1,  45.00, 0.00, 'WSIB Form 8 Electronic — TBI first report'),
(1, 2, '5101', '2025-09-22', 1, 159.14, 0.00, 'OT in-home treatment — backward chaining ADL'),
(1, 3, '5101', '2025-10-06', 1, 159.14, 0.00, 'OT in-home treatment — cognitive strategy training'),

-- Invoice 2 line items: Maria Santos PT visits
(2, 6, 'P101', '2025-10-22', 1, 74.25, 9.65, 'PT in-home initial assessment — rotator cuff'),
(2, 7, 'P201', '2025-10-29', 1, 62.40, 8.11, 'PT in-home treatment — manual therapy + ultrasound'),
-- Note: appt 8 was no-show — not billed

-- Invoice 3 line items: Robert Nkemdirim OT visits
(3, 10, '5101', '2025-08-25', 1, 159.14, 0.00, 'OT in-home initial assessment — SCI T6 paraplegia'),
(3, 11, '5101', '2025-09-08', 1, 159.14, 0.00, 'OT in-home treatment — wheelchair seating + ADL'),

-- Invoice 4 line items: Alex Thornton June (draft)
(4, 4, '5101', '2026-06-10', 1, 159.14, 0.00, 'OT in-home treatment — cognitive ADL training'),
(4, 4, '26M',  '2026-06-10', 1,  35.00, 0.00, 'WSIB Form 26 — progress report'),

-- Invoice 5 line items: David Kowalczyk FCE
(5, 12, '5100', '2025-12-13', 2, 79.58, 0.00, 'OT clinic FCE — 2 units (120 min)'),
(5, 12, '8ME',  '2025-12-13', 1, 45.00, 0.00, 'WSIB Form 8 Electronic — low back RSI'),
(5, 12, 'FAF',  '2025-12-13', 1, 45.00, 0.00, 'Functional Abilities Form (NOT same day as Form 8 — second submission)');

-- ============================================================
-- VERIFY DATA INTEGRITY (Informational comments)
-- ============================================================
-- Expected record counts after seed:
-- referral_sources: 10
-- insurers: 8
-- facilities: 8
-- service_codes: 16
-- clinicians: 5
-- clients: 6
-- wsib_claims: 5
-- treatment_plans: 4
-- appointments: 12
-- clinical_notes: 4
-- progress_reports: 3
-- invoices: 5
-- billing_line_items: 13
