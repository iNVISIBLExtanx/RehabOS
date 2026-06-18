# /generate-soap

Generate a structured SOAP note and WSIB form fields from a raw clinical dictation.

## Usage
```
/generate-soap [optional: paste dictation text here]
```

## What This Command Does
1. Takes a raw clinical dictation (or prompts you for one from `/data/synthetic-dictations.ts`)
2. Creates or updates `/app/api/generate-soap/route.ts` with the correct Claude tool-use pattern
3. Ensures the Zod schema in `/lib/schemas/soap.schema.ts` matches the prompt structure
4. Creates or updates the `SOAPViewer` component to render the structured output

## Rules For This Command
- ALWAYS use tool-use (not "return JSON") for the Claude API call
- ALWAYS validate with Zod before returning — throw if validation fails
- Temperature must be 0 for clinical extraction
- System prompt MUST include: "If information is not present, return null. Never invent clinical findings."
- The route handler must be server-side only — no `"use client"` in route files
- Return a typed `NextResponse.json()` — never return raw text

## SOAP Schema To Use
The output must conform to this structure (match the Zod schema in `/lib/schemas/soap.schema.ts`):
```typescript
{
  soap: {
    subjective: string | null,    // Patient's own words, pain rating, HEP compliance
    objective: string | null,     // Measurable findings: ROM, MMT, interventions
    assessment: string | null,    // Clinical reasoning and progress toward goals
    plan: string | null           // Next steps, frequency, referrals
  },
  clinical_flags: {
    pain_rating: number | null,   // 0-10 as stated by client
    visit_setting: "in_home" | "clinic" | "telehealth" | "school" | "workplace" | null,
    rtw_relevant: boolean,        // True if return-to-work was discussed
    form_required: "Form8" | "Form26" | "FAF" | "none" | null,
    suggested_service_code: string | null  // e.g. "5101" for in-home OT visit
  },
  confidence: "high" | "medium" | "low"  // How complete the input was
}
```

## Example Prompt to Claude
After creating the route, test it with Sample 1 from `/data/synthetic-dictations.ts` (Alex Thornton TBI case).
