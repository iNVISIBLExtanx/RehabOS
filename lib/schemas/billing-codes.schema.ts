import { z } from "zod";

// Output schema for /api/suggest-codes route.
// Validates Claude's billing code suggestions before rendering in BillingSuggestions.tsx.
// Billing rules enforced here come from docs/CLINICAL_DOMAIN.md §"Billing Code Rules".

export const BillingCodeSuggestionSchema = z.object({
  service_code:  z.string(),                               // e.g. "5101", "8ME", "26M"
  description:   z.string(),                               // Human-readable label
  fee_cad:       z.number().nonnegative(),                 // Fee per WSIB 2026 schedule
  rationale:     z.string(),                               // Why this code applies
  confidence:    z.enum(["high", "medium", "low"]),
  rule_warning:  z.string().nullable(),                    // e.g. RULE 1 FAF violation note
  is_primary:    z.boolean(),                              // True for the main visit code
});

export const BillingCodesSchema = z.object({
  suggestions:   z.array(BillingCodeSuggestionSchema).min(1).max(4),
  billing_notes: z.string().nullable(),                    // Free-text summary for clinician
  // Flags for CLAUDE.md billing rules
  rule_violations: z.object({
    faf_same_day_as_form8:        z.boolean(), // RULE 1: FAF not same day as Form 8
    acupuncture_with_clinic_visit: z.boolean(), // RULE 5: 5130 not same session as 5100
    wrong_form26_code:             z.boolean(), // RULE 3: using 26 or 26E instead of 26M
    in_home_coded_as_clinic:       z.boolean(), // RULE 2: 5100 used when should be 5101
  }),
});

export type BillingCodeSuggestion = z.infer<typeof BillingCodeSuggestionSchema>;
export type BillingCodes = z.infer<typeof BillingCodesSchema>;
