# Clinical Domain Reference — FunctionAbility Rehabilitation Context

This file is a domain-knowledge skill for Claude Code.
Load it when working on: ClinicalPipeline components, API route handlers, Zod schemas, or any file touching WSIB forms, SOAP notes, or billing codes.

---

## Company Context

FunctionAbility provides **community-based, multidisciplinary rehabilitation** to clients with:
- Traumatic Brain Injury (TBI)
- Spinal Cord Injury (SCI)
- Acquired Brain Injury (ABI / CVA / stroke)
- Complex orthopedic injuries (rotator cuff, hand/flexor tendon, low back)
- Catastrophic MVA and workplace injuries

**Clinician types:** Occupational Therapist (OT), Physiotherapist (PT), Speech-Language Pathologist (SLP), Social Worker (SW), Rehabilitation Therapist (RT), Case Manager (CM).

**Funders:** WSIB (Workplace Safety & Insurance Board), MVA/auto insurers (Intact, Aviva, Wawanesa), medical-legal/tort, private extended health (Manulife, Sun Life, Great-West Life), LTD, out-of-pocket.

**Delivery setting:** Client's home, school, workplace, community — not a clinical office. Clinicians travel to clients. This is why in-field mobile documentation is the core pain point.

---

## SOAP Note — Full Structure

### OT Example: Post-TBI Client, In-Home Visit

**S — Subjective**
Client reports headache rated 4/10 at rest, 7/10 with sustained concentration. Spouse notes increased irritability and difficulty initiating ADLs in the morning. Client states "I can make coffee but forget the steps halfway through." HEP exercises completed 3/7 days this week.

**O — Objective**
- COGNISTAT administered: Memory 7/12, Attention 6/12, Judgment 8/12
- 3-step meal preparation task (eggs on toast): required 4 verbal cues for sequencing; completed in 34 min (baseline: 52 min — improvement noted)
- Fatigue rating post-task: 6/10
- Dynamic balance on kitchen mat: steady, no LOB
- Grip strength (Jamar dynamometer): R 28 lbs / L 31 lbs (client is left-dominant)
- Intervention: strategy training for ADL sequencing (backward chaining), energy conservation techniques, environmental modification review (labelled drawers, step-by-step visual cue cards posted)

**A — Assessment**
Client demonstrates improving sequencing ability for familiar multi-step ADLs, with reduced cueing required compared to last session (previously 7 cues). Persistent challenges with novel multi-step tasks and sustained attention. Fatigue remains a significant barrier to independence. Goals 1 (meal preparation) and 2 (medication management) progressing; goal 3 (return to part-time volunteer work) not yet initiated — deferred pending cognitive endurance improvement.

**P — Plan**
- Next session: introduce medication management routine using pill organizer + alarm strategy
- Continue meal preparation backward chaining — target 2 cues or fewer by next month
- Refer to psychology for fatigue management strategies
- Update treating physician re: cognitive status — request neuropsychological assessment if no improvement in 4 weeks
- HEP: maintain current exercises, add 10-min attention training game (Lumosity) daily
- Frequency: weekly x 4 weeks, then reassess

---

### PT Example: Post-MVA Rotator Cuff, Home Visit

**S — Subjective**
Client reports shoulder pain 5/10 at rest, 8/10 overhead activity. States "I can reach the second shelf but not above my head." Sleeping on affected (L) side still not tolerated. HEP compliant 5/7 days — demonstrates correct technique for external rotation exercise. No numbness or paraesthesia reported.

**O — Objective**
- L shoulder AROM: Flexion 135° (↑ from 120° last visit), Abduction 125°, ER 40°, IR 60°
- PROM: Flexion 148°, Abduction 140° — end feel slightly firm
- MMT: Supraspinatus 3+/5, Infraspinatus 4-/5, Deltoid 4/5
- Hawkins-Kennedy: Positive (reproduced pain at 110° flexion + IR)
- Grip (unaffected R): 48 lbs
- Intervention: Therapeutic ultrasound L supraspinatus (1MHz, 1.2 W/cm², 5 min), manual therapy glenohumeral posterior capsule, progressive RTC strengthening with Theraband

**A — Assessment**
ROM improving consistently — 15° flexion gained over 3 sessions. Strength lagging behind ROM gains; supraspinatus still significantly weak. No significant neural involvement. Impingement likely resolving with conservative treatment; re-evaluate for specialist referral at 6-week mark if supraspinatus MMT does not reach 4/5.

**P — Plan**
- Progress Theraband to next resistance level for ER/IR
- Introduce eccentric loading for supraspinatus (scaption with 0.5 lb weight)
- Sleep position education: trial of body pillow for R-side positioning
- Frequency: 2x/week x 3 weeks
- WSIB Form 26 due — will complete following today's visit

---

## WSIB Form 8 — Field Map (form 0008A, 2 pages)

Use this to map Claude SOAP output → Form 8 fields in `WSIBFormViewer.tsx`.

### Page 1

**Section A — Patient & Employer**
- `worker_first_name`, `worker_last_name`
- `worker_dob` (dd/mmm/yyyy)
- `worker_sex` (M / F)
- `worker_address`, `worker_city`, `worker_postal`
- `worker_phone`
- `worker_sin` (last 3 digits only for demo — never full SIN)
- `worker_language` (E / F)
- `employer_name`, `employer_address`
- `claim_number` (WSIB-assigned, blank on first submission)
- `date_of_incident` (dd/mmm/yyyy)

**Section B — Incident Details**
- `how_injury_occurred` (free text, ~100 words)
- `worker_occupation`
- `date_first_seen` (date clinician first assessed client)

**Section C — Clinical Information**
- `body_area` (checkboxes: head/neck/shoulder/elbow/wrist/hand/chest/back/hip/knee/ankle/foot + L/R)
- `pain_at_rest` (0–10)
- `pain_with_activity` (0–10)
- `pain_at_night` (Y/N)
- `injury_type` (checkboxes: sprain/strain, contusion, fracture, RSI, tendonitis, neurological dysfunction, other)
- `diagnosis` (free text — ICD-10 code optional)
- `pre_existing_factors` (Y/N + description)
- `physical_exam_findings` (free text)

**Section D — Treatment Plan**
- `treatment_type` (OT/PT/other checkboxes)
- `treatment_duration` (e.g., "1x/week x 8 weeks")
- `medications_prescribed` (physicians only — OTs/PTs leave blank)
- `investigations` (X-ray/CT/MRI/EMG/ultrasound checkboxes + date ordered)
- `referrals` (physiotherapist/OT/specialist/REC checkboxes)

**Section E — Billing**
- `hp_designation` (Chiropractor / Physician / Physiotherapist / Nurse Practitioner / OT)
- `service_code` (`8M` or `8ME`)
- `wsib_provider_id`
- `hst_number` (if applicable)
- `invoice_number`
- `service_date` (dd/mmm/yyyy)

**Section F — Return to Work (page 2)**
- `rtw_discussed` (Y/N)
- `rtw_status` (regular duties / modified duties / not able to work)
- `rtw_start_date`
- `graduated_hours` (if applicable)
- **Functional abilities grid** (Able / Not able, for each):
  `bend_twist`, `climb`, `kneel`, `lift`, `operate_motor_vehicle`, `push_pull`, `sit`, `stand`, `use_upper_extremities`, `walk`
- `limitations_duration` (1–2 / 3–7 / 8–14 / 14+ days)
- `follow_up_date`

**Section G — Worker Signature**
- Authorization to share functional abilities page with employer

---

## WSIB Form 26 — Field Map (form 0896A, single page)

**Header**
- `worker_name`, `claim_number`, `date_of_incident`, `wsib_provider_id`

**Part 1 — Return to Work**
- Q1: `rtw_status` (regular / modified / not able)
- `rtw_date`, `graduated_schedule`
- **Functional abilities grid** (Full / Some for each ability — same grid as Form 8 + free-text "additional comments")
- Note: "Pain should not be the only medical restriction" — this is preprinted on the form; render it visibly

**Part 2 — Clinical Information & Treatment Plan**
- Q3: `change_since_last_visit` (Recovered / Improving / Unchanged / Worsening)
- Q4: `current_diagnosis` (free text)
- Q5: `pre_existing_other_factors` (free text or null)
- Q6: `prognosis` (one of: "partially recovered & improving" / "full recovery not yet known" / "fully recovered" / "partially recovered, full recovery in ~__ weeks" / "full recovery not expected")
- Q7: `current_treatment_plan` (free text)

**Part 3 — Billing**
- `hp_designation`
- `service_code` — always `26M` (preprinted on real form)
- `wsib_provider_id`, `hst_number`, `invoice_number`, `service_date`
- Clinician signature + date

---

## Billing Code Rules (Important Business Logic)

```
RULE 1: Form 8 (8M or 8ME) is the ONLY code on a first visit.
        A FAF ($45) is NOT paid on the same day as Form 8.

RULE 2: Home/community visits (5101 = $159.14) are significantly higher than
        clinic visits (5100 = $79.58). Always flag the visit setting.

RULE 3: Form 26 uses preprinted code 26M — never suggest code 26 or 26E
        as a substitute on a progress report.

RULE 4: WSIB applied 2.0% CPI fee increase effective Jan 1, 2026.
        Label all fees as "per WSIB fee schedule — verify current rates."

RULE 5: A session that includes acupuncture (5130 = $52.31) bills 5130,
        NOT both 5100 and 5130 in the same session.
```

---

## Claude Prompt Templates

### System Prompt — Clinical Scribe Role
```
You are a clinical documentation assistant helping an Ontario occupational therapist
structure their session notes for WSIB billing purposes.

Rules:
- Extract only information explicitly stated in the dictation. Never invent clinical findings.
- If a field has no corresponding information, return null.
- Use standard OT/PT abbreviations where appropriate (ROM, MMT, ADL, HEP, etc.).
- All output is a draft for clinician review — label it as such.
- Do not suggest diagnoses beyond what the clinician stated.
- Pain ratings must come from the client's stated score, not be inferred.
```

### Tool Schema Pattern (TypeScript)
```typescript
// Use this pattern for all Claude API calls returning structured data
const response = await anthropic.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 2048,
  temperature: 0,
  system: CLINICAL_SCRIBE_SYSTEM_PROMPT,
  tools: [{
    name: "structure_soap_note",
    description: "Extract and structure a SOAP note from clinical dictation",
    input_schema: zodToJsonSchema(SoapNoteSchema)  // use zod-to-json-schema
  }],
  tool_choice: { type: "tool", name: "structure_soap_note" },
  messages: [{ role: "user", content: `Dictation:\n\n${dictationText}` }]
});

// Validate — never skip this
const toolUse = response.content.find(b => b.type === "tool_use");
if (!toolUse) throw new Error("No tool_use block in response");
const validated = SoapNoteSchema.parse(toolUse.input);
```

---

## Realistic Synthetic Dictation Samples

These are hardcoded in `/data/synthetic-dictations.ts`. Use them as demo inputs.

### Sample 1 — TBI In-Home OT Visit (Alex T.)
```
Saw Alex at his home on June 10th. He reports headaches four out of ten at rest, 
worse with concentration. Wife says he's more irritable and has trouble starting 
his morning routine. He tells me he can start making coffee but forgets the steps 
in the middle. Did the three-step breakfast task today — eggs on toast — he needed 
four verbal cues and took 34 minutes. Last time it was seven cues so that's progress. 
Did cognitive assessment, memory was 7 out of 12, attention 6 out of 12. Grip strength 
right hand 28 pounds, left 31. He's left dominant. His home exercise program compliance 
was three out of seven days. I worked on backward chaining and energy conservation. 
Posted visual cue cards in the kitchen. Plan is to introduce medication management 
next week and refer to psychology for fatigue. Seeing him weekly for another four weeks.
```

### Sample 2 — Post-MVA Rotator Cuff PT Visit (Maria S.)
```
Home visit with Maria today, June 11th. She's reporting left shoulder pain five out of 
ten at rest, goes up to eight when reaching overhead. She can get to the second shelf 
but not above her head. Still can't sleep on the left side. Exercise compliance was 
five out of seven days and her technique looked good. Active range of motion — flexion 
to 135, abduction 125, external rotation 40, internal rotation 60. That's up from 120 
flexion last week. Manual muscle testing supraspinatus 3 plus out of 5, infraspinatus 
4 minus. Hawkins Kennedy positive. Did ultrasound and manual therapy to the posterior 
capsule, then did progressive strengthening with the Theraband. Plan is to move up 
a Theraband resistance, add some eccentric loading, and see her twice a week for 
three more weeks. Need to complete Form 26 for WSIB today.
```

### Sample 3 — SCI Wheelchair Seating OT Assessment (Robert N.)
```
Assessment visit at Robert's home on June 12th. He has T6 complete paraplegia from 
a workplace incident eight months ago. Referred for wheelchair seating and ADL 
retraining. He reports pressure sore developing on right ischial tuberosity, rates 
discomfort as 6 out of 10 after two hours in chair. Current wheelchair is hospital-issue, 
not custom. Upper body strength — shoulder flexors and extensors bilaterally 5 out of 5. 
Elbow 5 out of 5. Wrist extensors 5 out of 5, no hand intrinsics. Skin inspection shows 
2 centimetre stage 2 pressure injury right ischium, no undermining. ADL assessment — 
independent with upper body dressing, requires setup assistance for lower body. 
Transfers — independent sliding board, can manage car transfers with adapted technique. 
Recommended custom power-tilt wheelchair with pressure-relief cushion, refer to seating 
clinic. Plan to see twice monthly for ADL training and skin management education.
```

### Sample 4 — Return-to-Work OT Functional Assessment (David K.)
```
Functional capacity evaluation with David at our clinic on June 13th. Low back RSI 
from repetitive lifting on the line at the plant. He's been off for six weeks. 
Reports pain 3 out of 10 at rest, 7 out of 10 with bending and lifting. 
No radiation down the legs. Lumbar flexion to 65 degrees, extension 15 degrees, 
lateral flexion right 20 left 18. Straight leg raise negative bilaterally. 
Did the EPIC lift capacity test — safely lifted 20 kg from floor to knuckle height, 
15 kg knuckle to shoulder. Employer has a modified duties program — light assembly 
work, no lifting over 10 kg, sitting and standing alternating every 30 minutes. 
Based on today's assessment David can return to modified duties next Monday. 
He should not lift more than 10 kg, avoid repetitive bending, and have the 
alternating sit-stand schedule. I'll complete Form 8 for WSIB and the functional 
abilities form today. Follow-up in three weeks to reassess for full duties.
```
