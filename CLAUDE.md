# RehabOS Showcase — CLAUDE.md

## What This App Is
A single-page demo app built to prove three things to FunctionAbility Rehabilitation Services (Concord, ON):
1. Deep clinical/WSIB domain understanding (AI Clinical Notes Pipeline)
2. Senior SQL and database design skills (DB & SQL Explorer)
3. WinForms/legacy-stack readiness and modernization judgment (WinForms → Web module)

**All patient data is synthetic. Label every screen "Demo — Synthetic Data Only".**
This is a job-application portfolio piece, not a production clinical system.

---

## Tech Stack & Versions
- **Framework:** Next.js 14 (App Router, `/app` directory)
- **Language:** TypeScript — strict mode (`"strict": true` in tsconfig)
- **Styling:** Tailwind CSS v3
- **Database:** Supabase (PostgreSQL) — persistent store
- **In-browser SQL:** pglite — DB Explorer live query runner (no backend needed)
- **AI:** Anthropic `claude-sonnet-4-6` via server-side Route Handlers only
- **Schema viz:** React Flow v11 — interactive ERD
- **Validation:** Zod — every Claude API response validated before render
- **Deployment:** Vercel (Hobby tier, non-commercial demo)

---

## Commands
```bash
npm run dev          # localhost:3000
npm run build        # production build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit (run before every commit)
npm run db:reset     # supabase db reset --linked (resets + reruns migrations)
```

---

## Directory Structure
```
/app
  layout.tsx
  page.tsx                        # Single entry point — renders <TabShell />
  /api
    /generate-soap/route.ts       # Raw text → structured SOAP (Claude)
    /generate-forms/route.ts      # SOAP → WSIB Form 8 + Form 26 fields (Claude)
    /suggest-codes/route.ts       # SOAP + form data → billing code suggestions (Claude)

/components
  /ClinicalPipeline
    PipelineContainer.tsx         # Orchestrates all 4 pipeline steps
    DictationInput.tsx            # Textarea + optional Web Speech API mic
    SOAPViewer.tsx                # Side-by-side raw / structured SOAP
    WSIBFormViewer.tsx            # Renders Form 8 and Form 26 with editable fields
    BillingSuggestions.tsx        # Suggested codes with rationale + confidence badge
  /DBExplorer
    ERDDiagram.tsx                # React Flow — 13-table schema, zoomable
    SQLRunner.tsx                 # pglite live query executor + results table
    QueryLibrary.tsx              # 6 canned senior queries (CTE, window functions, etc.)
    ExplainViewer.tsx             # EXPLAIN ANALYZE output viewer
  /WinFormsDemo
    WinFormsShell.tsx             # XP.css MDI shell — title bar, menu strip, status bar
    DataGridView.tsx              # WinForms-style DataGridView replica
    ConceptMapper.tsx             # WinForms concept ↔ React equivalent table
    StranglerFigRoadmap.tsx       # 4-step YARP → Blazor migration roadmap
  /shared
    TabNav.tsx                    # Top-level tab navigation
    SyntheticBanner.tsx           # "Demo — Synthetic Data Only" sticky banner

/lib
  anthropic.ts                    # Server-side Claude client (never import in client components)
  supabase.ts                     # Supabase client (server + browser variants)
  pglite.ts                       # In-browser pglite instance with schema loaded
  /schemas
    soap.schema.ts                # Zod schema for SOAP Claude output
    wsib-form8.schema.ts          # Zod schema for Form 8 Claude output
    wsib-form26.schema.ts         # Zod schema for Form 26 Claude output
    billing-codes.schema.ts       # Zod schema for billing suggestions

/data
  synthetic-dictations.ts         # 4 realistic OT/PT dictation samples for demo
  service-codes.ts                # WSIB fee schedule reference data (client-safe)
  pglite-seed.sql                 # In-browser schema + seed (identical to migrations)

/supabase
  /migrations
    001_create_schema.sql
    002_seed_service_codes.sql
    003_seed_demo_data.sql

/docs
  CLINICAL_DOMAIN.md              # WSIB, SOAP, Form 8/26 domain reference for Claude
  WINFORMS_CONCEPTS.md            # WinForms paradigm → React mapping reference

/.claude
  /commands
    generate-soap.md              # /generate-soap slash command
    new-query.md                  # /new-query slash command
    seed-patient.md               # /seed-patient slash command
```

---

## Architecture Rules

### API Key — Never In The Browser
- `ANTHROPIC_API_KEY` lives in `.env.local` only
- Only import `lib/anthropic.ts` in `/app/api/**/route.ts` files
- All three pipeline steps are separate Route Handlers (`/api/generate-soap`, `/api/generate-forms`, `/api/suggest-codes`)
- Never use `NEXT_PUBLIC_` prefix for the API key

### Claude API — Always Use Tool Use For Structured Output
Every Claude call that returns structured data must use tool-use, not "please return JSON":
```typescript
// CORRECT — force tool use with exact schema
const response = await anthropic.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 2048,
  tools: [{ name: "extract_soap", input_schema: SoapZodToJsonSchema }],
  tool_choice: { type: "tool", name: "extract_soap" },
  messages: [{ role: "user", content: prompt }]
});
// Validate with Zod before returning to client
const parsed = SoapSchema.parse(response.content[0].input);
```
- Temperature: `0` for extraction/structuring, `0.3` for narrative generation
- Always include in system prompt: **"If information is not present in the input, use null. Never invent clinical findings."**
- Add a 30-second timeout on all API calls

### Forms Are Never Auto-Submitted
The WSIB Form 8 and Form 26 viewers must:
- Render all fields as **editable inputs** pre-populated by Claude
- Show a "Review & Confirm" step before any "Submit" action
- Display a visible disclaimer: "AI-generated draft — clinician must review before submission"

### Zod Validation Is Mandatory
Every Claude response is validated with the matching Zod schema before being returned to the client. If validation fails, return a structured error — never pass raw unvalidated output to components.

---

## Coding Conventions
- **Named exports only** — no default exports except page.tsx/layout.tsx
- **Functional components** — no class components
- **Async server components** for data fetching; client components only where interactivity is needed (`"use client"` at the top)
- **No `any` types** — use `unknown` and narrow, or define proper interfaces
- **Error boundaries** around each tab — one tab crashing must not break others
- Tailwind for all styling — no inline styles, no CSS modules
- React Flow nodes must be memoised (`React.memo`) to prevent re-render thrashing

---

## Domain Knowledge (Quick Reference)

### The Business Problem This App Solves
OT/PT/SLP clinicians at FunctionAbility work in community settings (client homes, schools). After each visit they must:
1. Write a SOAP note from memory/dictation (~20–40 mins manual work)
2. If WSIB: complete Form 8 (first report) or Form 26 (progress report) with structured fields
3. Select the correct billing service code and submit to WSIB via TELUS Health eServices
This app demos AI handling steps 1–3 with human review before any submission.

### SOAP Note Structure
- **S (Subjective):** Client's own words, pain rating (0–10), HEP compliance, functional complaints
- **O (Objective):** Measurable findings — ROM, grip strength (lbs), MMT grade, ADL assessment, interventions delivered
- **A (Assessment):** Clinical reasoning — progress toward goals, functional implications, barriers
- **P (Plan):** Next session plan, frequency, equipment, referrals, HEP updates

### WSIB Forms
- **Form 8 (0008A):** First report after injury. Sections A–G. Billing codes: `8M` ($40 paper), `8ME` ($45 electronic)
- **Form 26 (0896A):** Progress report. Parts 1–3. Preprinted billing code: `26M`
- **FAF:** Functional Abilities Form — paid separately at $45, NOT on same day as Form 8

### Key WSIB Service Codes
| Code | Description | Fee (post Jan 2026 CPI) |
|------|-------------|------------------------|
| 5100 | OT clinic visit | $79.58 |
| 5101 | OT home/community visit | $159.14 |
| 5130 | Acupuncture | $52.31 |
| 8M   | Form 8 (paper) | $40.00 |
| 8ME  | Form 8 (electronic) | $45.00 |
| 26M  | Form 26 (paper) | ~$35 (illustrative) |
| FAF  | Functional Abilities Form | $45.00 |

### Common OT/PT Abbreviations
`ROM` Range of motion · `MMT` Manual muscle test · `ADL` Activities of daily living · `IADL` Instrumental ADL · `HEP` Home exercise program · `BUE/UE/LE` Bilateral upper extremity / Upper / Lower extremity · `TBI` Traumatic brain injury · `SCI` Spinal cord injury · `CVA` Cerebrovascular accident (stroke) · `RSI` Repetitive strain injury · `POC` Program of Care · `RTW` Return to work

---

## Important Rules — Never Break These
1. **No real PHI ever** — synthetic patients only, banner always visible
2. **No API key in client code** — Route Handlers only
3. **Zod validate every Claude response** — no raw pass-through
4. **Forms require human review** — never auto-submit
5. **Run `npm run typecheck` before marking any task complete**
6. **Keep the demo fast** — if a Claude call exceeds 30s, show a timeout error rather than hanging

---

## Deployment
- Platform: Vercel (Hobby tier)
- Environment variables: `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Set a spending cap on the Anthropic key ($5–$10 for a public demo)
- The `/api/generate-*` routes should have basic rate limiting (max 10 requests/min per IP)
