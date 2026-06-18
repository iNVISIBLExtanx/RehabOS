# /seed-patient

Generate a new synthetic patient scenario for the clinical pipeline demo.

## Usage
```
/seed-patient [injury-type: tbi|sci|rotator-cuff|low-back|stroke|hand]
```

## What This Command Does
1. Generates a realistic synthetic dictation for the specified injury type
2. Adds it to `/data/synthetic-dictations.ts` as a new entry
3. Adds matching seed rows to the pglite in-memory schema (client + claim + appointment)
4. Does NOT add to Supabase migrations (in-memory only for pglite demo)

## Rules For This Command
- ALL generated patients must have clearly fictitious names (not real people)
- Pain ratings, ROM values, and MMT grades must be clinically realistic
- Dictation must be written in first-person clinician voice ("Saw [client] at their home...")
- Include HEP compliance, specific measurements, and an intervention description
- Dictation length: 150–250 words (realistic for a voice memo)
- Visit setting: default to in-home (FunctionAbility's primary model)

## Injury Type Reference
| Type | Primary discipline | WSIB code | Common diagnoses |
|------|--------------------|-----------|-----------------|
| tbi | OT | 5101 | Post-concussion syndrome, TBI cognitive rehab |
| sci | OT | 5101 | Paraplegia/tetraplegia, SCI ADL retraining |
| rotator-cuff | PT | 5101 | Rotator cuff tear, shoulder impingement |
| low-back | OT or PT | 5100/5101 | Lumbar RSI, disc derangement, FCE |
| stroke | OT | 5101 | CVA hemiparesis, aphasia, ADL retraining |
| hand | OT | 5101 | Flexor tendon repair, TFCC, hand therapy |

## Output Format (add to synthetic-dictations.ts)
```typescript
{
  id: string,                    // e.g. "sample-5-hand-flexor"
  label: string,                 // e.g. "Hand — Flexor Tendon Repair (Linda F.)"
  discipline: "OT" | "PT" | "SLP",
  injury_type: string,
  wsib_code: string,             // Suggested primary service code
  dictation: string              // The raw clinical dictation text
}
```
