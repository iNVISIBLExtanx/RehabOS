import { z } from "zod";

// Output schema for /api/generate-forms route — Form 26 (0896A) extraction.
// Field map sourced from docs/CLINICAL_DOMAIN.md §"WSIB Form 26 — Field Map".
// RULE: service_code is ALWAYS 26M — never 26 or 26E (preprinted on real form).

// Form 26 uses "Full / Some" scale, not "Able / Not Able" like Form 8
const FunctionalAbilitiesForm26Schema = z.object({
  bend_twist:             z.enum(["full", "some", "not_able"]).nullable(),
  climb:                  z.enum(["full", "some", "not_able"]).nullable(),
  kneel:                  z.enum(["full", "some", "not_able"]).nullable(),
  lift:                   z.enum(["full", "some", "not_able"]).nullable(),
  operate_motor_vehicle:  z.enum(["full", "some", "not_able"]).nullable(),
  push_pull:              z.enum(["full", "some", "not_able"]).nullable(),
  sit:                    z.enum(["full", "some", "not_able"]).nullable(),
  stand:                  z.enum(["full", "some", "not_able"]).nullable(),
  use_upper_extremities:  z.enum(["full", "some", "not_able"]).nullable(),
  walk:                   z.enum(["full", "some", "not_able"]).nullable(),
});

export const WsibForm26Schema = z.object({
  // Header
  worker_first_name:  z.string().nullable(),
  worker_last_name:   z.string().nullable(),
  claim_number:       z.string().nullable(),
  date_of_incident:   z.string().nullable(),          // ISO date string
  wsib_provider_id:   z.string().nullable(),

  // Part 1 — Return to Work
  rtw_status: z.enum([
    "regular_duties", "modified_duties", "unable_to_work",
  ]).nullable(),
  rtw_date:           z.string().nullable(),          // ISO date string
  graduated_schedule: z.string().nullable(),
  functional_abilities: FunctionalAbilitiesForm26Schema.nullable(),
  // "Pain should not be the only medical restriction" — preprinted note, render visibly
  additional_comments: z.string().nullable(),

  // Part 2 — Clinical Information & Treatment Plan
  change_since_last: z.enum([
    "recovered", "improving", "unchanged", "worsening",
  ]).nullable(),
  current_diagnosis:          z.string().nullable(),
  pre_existing_other_factors: z.string().nullable(),
  prognosis: z.enum([
    "partially recovered & improving",
    "full recovery not yet known",
    "fully recovered",
    "partial recovery expected",
    "full recovery not expected",
  ]).nullable(),
  current_treatment_plan: z.string().nullable(),

  // Part 3 — Billing
  hp_designation:  z.enum(["OT", "PT", "Physician", "Chiropractor", "NP"]).nullable(),
  service_code:    z.literal("26M"),                  // Always 26M — preprinted on form
  hst_number:      z.string().nullable(),
  service_date:    z.string().nullable(),             // ISO date string
});

export type WsibForm26 = z.infer<typeof WsibForm26Schema>;
