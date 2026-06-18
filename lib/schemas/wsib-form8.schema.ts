import { z } from "zod";

// Output schema for /api/generate-forms route — Form 8 (0008A) extraction.
// Field map sourced from docs/CLINICAL_DOMAIN.md §"WSIB Form 8 — Field Map".
// RULE: Form 8 (8M or 8ME) is the ONLY code on a first visit. FAF not same day.

const FunctionalAbilitiesSchema = z.object({
  bend_twist:              z.enum(["able", "some", "not_able"]).nullable(),
  climb:                   z.enum(["able", "some", "not_able"]).nullable(),
  kneel:                   z.enum(["able", "some", "not_able"]).nullable(),
  lift:                    z.enum(["able", "some", "not_able"]).nullable(),
  operate_motor_vehicle:   z.enum(["able", "some", "not_able"]).nullable(),
  push_pull:               z.enum(["able", "some", "not_able"]).nullable(),
  sit:                     z.enum(["able", "some", "not_able"]).nullable(),
  stand:                   z.enum(["able", "some", "not_able"]).nullable(),
  use_upper_extremities:   z.enum(["able", "some", "not_able"]).nullable(),
  walk:                    z.enum(["able", "some", "not_able"]).nullable(),
});

export const WsibForm8Schema = z.object({
  // Section A — Worker & Employer
  worker_first_name:   z.string().nullable(),
  worker_last_name:    z.string().nullable(),
  worker_dob:          z.string().nullable(),         // ISO date string
  worker_sex:          z.enum(["M", "F", "X"]).nullable(),
  worker_address:      z.string().nullable(),
  worker_city:         z.string().nullable(),
  worker_postal:       z.string().nullable(),
  worker_phone:        z.string().nullable(),
  worker_sin_last3:    z.string().max(3).nullable(),  // Last 3 digits only — never full SIN
  worker_language:     z.enum(["E", "F"]).nullable(),
  employer_name:       z.string().nullable(),
  employer_address:    z.string().nullable(),
  claim_number:        z.string().nullable(),
  date_of_incident:    z.string().nullable(),         // ISO date string

  // Section B — Incident Details
  how_injury_occurred:  z.string().nullable(),
  worker_occupation:    z.string().nullable(),
  date_first_seen:      z.string().nullable(),        // ISO date string

  // Section C — Clinical Information
  body_area: z.array(z.enum([
    "head", "neck", "shoulder", "elbow", "wrist", "hand",
    "chest", "back", "hip", "knee", "ankle", "foot",
  ])).nullable(),
  body_side:            z.enum(["L", "R", "bilateral"]).nullable(),
  pain_at_rest:         z.number().min(0).max(10).nullable(),
  pain_with_activity:   z.number().min(0).max(10).nullable(),
  pain_at_night:        z.boolean().nullable(),
  injury_type: z.array(z.enum([
    "sprain_strain", "contusion", "fracture", "RSI",
    "tendonitis", "neurological", "TBI", "SCI", "other",
  ])).nullable(),
  diagnosis:              z.string().nullable(),      // ICD-10 preferred
  pre_existing_factors:   z.string().nullable(),
  physical_exam_findings: z.string().nullable(),

  // Section D — Treatment Plan
  treatment_type: z.array(z.enum(["OT", "PT", "SLP", "other"])).nullable(),
  treatment_duration:       z.string().nullable(),    // e.g. "1x/week x 8 weeks"
  medications_prescribed:   z.string().nullable(),    // Physicians only — OT/PT leave null
  investigations: z.array(z.enum([
    "x_ray", "CT", "MRI", "EMG", "ultrasound", "other",
  ])).nullable(),
  referrals: z.array(z.enum([
    "physiotherapist", "OT", "specialist", "psychology",
    "neuropsychologist", "REC", "other",
  ])).nullable(),

  // Section E — Billing
  hp_designation:   z.enum(["OT", "PT", "Physician", "Chiropractor", "NP"]).nullable(),
  service_code:     z.enum(["8M", "8ME"]).nullable(), // Only Form 8 codes allowed
  wsib_provider_id: z.string().nullable(),
  hst_number:       z.string().nullable(),
  service_date:     z.string().nullable(),            // ISO date string

  // Section F — Return to Work
  rtw_discussed:       z.boolean().nullable(),
  rtw_status:          z.enum(["regular_duties", "modified_duties", "unable_to_work"]).nullable(),
  rtw_start_date:      z.string().nullable(),         // ISO date string
  graduated_hours:     z.string().nullable(),
  functional_abilities: FunctionalAbilitiesSchema.nullable(),
  limitations_duration: z.enum(["1-2", "3-7", "8-14", "14+"]).nullable(),
  follow_up_date:       z.string().nullable(),        // ISO date string
});

export type WsibForm8 = z.infer<typeof WsibForm8Schema>;
