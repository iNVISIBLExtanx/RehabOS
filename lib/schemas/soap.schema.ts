import { z } from "zod";

// Output schema for /api/generate-soap route.
// Matches the tool-use output spec in .claude/commands/generate-soap.md exactly.
// Temperature 0 — extraction only, never inventive.

export const SoapNoteSchema = z.object({
  soap: z.object({
    subjective: z.string().nullable(),  // Client's own words, pain rating, HEP compliance
    objective:  z.string().nullable(),  // Measurable findings: ROM, MMT, grip, interventions
    assessment: z.string().nullable(),  // Clinical reasoning, progress toward goals
    plan:       z.string().nullable(),  // Next steps, frequency, referrals, HEP updates
  }),
  clinical_flags: z.object({
    pain_rating: z.number().min(0).max(10).nullable(), // 0–10, as stated by client only
    visit_setting: z.enum([
      "in_home", "clinic", "telehealth", "school", "workplace",
    ]).nullable(),
    rtw_relevant:           z.boolean(),               // Was return-to-work discussed?
    form_required:          z.enum(["Form8", "Form26", "FAF", "none"]).nullable(),
    suggested_service_code: z.string().nullable(),     // e.g. "5101" for in-home OT
  }),
  confidence: z.enum(["high", "medium", "low"]),       // How complete was the input?
});

export type SoapNote = z.infer<typeof SoapNoteSchema>;
