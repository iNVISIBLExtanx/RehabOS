# RehabOS — Portfolio Demo for FunctionAbility Rehabilitation Services

**Live demo:** https://rehab-os-alpha.vercel.app  
**By:** Manodhya Opallage · [GitHub](https://github.com/iNVISIBLExtanx)

---

## Why I built this

Tom raised a fair concern: *"You're comfortable with modern stacks — will you get bored working with VB.NET and WinForms?"*

My honest answer is no, and here's why this demo shows that.

I didn't build this to suggest FunctionAbility should replace its stack. I built it to prove I've already started learning the domain — the WSIB billing rules, the Form 8/26 distinction, the difference between a 5101 in-home visit and a 5100 clinic visit, why the FAF can't be billed on the same day as Form 8. That domain knowledge is what took clinicians years to understand. A framework is something you pick up in weeks.

The business logic that lives in a system that has been running and billing correctly for years is the most valuable thing in that codebase — not the UI layer on top of it.

---

## Three things this demo proves

### 1. I understand the clinical bottleneck — and I've already applied AI to it

**The problem Tom described:** After every community visit, OT/PT clinicians spend 20–40 minutes writing SOAP notes from memory, then manually filling WSIB Form 8 or Form 26, then figuring out the correct billing code. That's dead time after an already long day in someone's home or school.

**What this demo does:**
- A clinician pastes or dictates their raw session notes (or picks a realistic sample)
- Claude structures them into a signed-off SOAP note (Subjective, Objective, Assessment, Plan)
- The relevant WSIB form (Form 8 or Form 26) is pre-populated with extracted fields — all **editable**, with a mandatory **Review & Confirm** step
- The correct billing codes are suggested with rationale, and any WSIB billing rule violations are flagged before submission

The AI never auto-submits anything. Every output is a draft for the clinician to review. That's not a technical limitation — it's a clinical compliance requirement, and this demo respects it.

> This is the same approach I used in my EduMark exam correction system and MedSim clinical simulation — AI handles the time-consuming structuring work, humans stay in the loop for the decision.

---

### 2. I take databases seriously — and I've already learned yours

Tom mentioned the database has grown and queries have become complex. I spent time understanding the schema before writing a line of code.

The **DB & SQL Explorer tab** shows:
- An interactive ERD of the 13-table WSIB rehabilitation schema I designed (clients, clinicians, appointments, clinical notes, progress reports, invoices, billing line items, service codes, and more)
- A live in-browser SQL runner — type any query, see results instantly, no backend call
- Six pre-built queries that demonstrate senior-level SQL:

| Query | Technique |
|-------|-----------|
| AR Aging Buckets | CTE + CASE buckets for 0–30 / 31–60 / 61–90 / 90+ day receivables |
| Clinician Utilization Ranking | `RANK()` window function, revenue share % |
| Running Revenue by Service Type | `SUM() OVER ROWS UNBOUNDED PRECEDING` |
| No-Show Rate by Clinician | `COUNT(*) FILTER (WHERE ...)` conditional aggregation |
| Month-over-Month Revenue | `LAG()` window function |
| Recursive Referral Chain | `WITH RECURSIVE` CTE |

Each query also includes a **T-SQL note** for the SQL Server equivalent — because I know that's what's running in production.

---

### 3. I respect what WinForms built — and I can work inside it

The third tab isn't titled "how to replace WinForms." It's titled "WinForms → React" because I want to show I understand the paradigm first.

**What the WinForms tab shows:**
- A pixel-accurate recreation of a WinForms MDI shell: title bar, MenuStrip (`#ece9d8` background), ToolStrip, TabControl, DataGridView with BindingNavigator, StatusStrip
- A DataGridView bound to synthetic FunctionAbility client data — header `#0a246a`, alternating rows, XP-style selected row highlight
- A 14-row concept mapping table: `DataGridView` = `<table>`, `Handles Button1.Click` = `onClick`, `BackgroundWorker` = `async/await`, `IsMdiContainer` = layout shell
- A 4-step Strangler Fig migration roadmap — YARP proxy → module-by-module replacement — for teams that want to modernise without a risky big-bang rewrite

I built this the same way a WinForms developer would think about it: what are the controls, what are the events, what does the status bar say, what is the MDI background colour. That's the detail that shows you're learning the tool, not just talking about it.

**On the "will you get bored" question:**

I've worked with legacy codebases before. What makes work interesting isn't the framework version — it's the problem complexity. WSIB billing rules, functional abilities assessments, POC types, RTW status workflows — that's genuinely complex domain logic that I'd be learning for months. The VB.NET syntax is the easy part.

I'm also the kind of developer who sees a messy legacy system and thinks *"this has been keeping people employed and clients rehabilitated for years — let's understand it before we touch anything."* Not *"let's rewrite it."*

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v3 |
| AI | Anthropic Claude (`claude-sonnet-4-6`) via server-side Route Handlers |
| Database | Supabase (PostgreSQL) — persistent store |
| In-browser SQL | pglite — no backend needed for the DB Explorer |
| Schema visualisation | React Flow v11 |
| Validation | Zod — every Claude API response validated before render |
| Deployment | Vercel |

**Architecture rules enforced throughout:**
- API key never in the browser — Route Handlers only
- Claude always uses tool-use (not "please return JSON") — typed, Zod-validated
- Forms never auto-submit — mandatory Review & Confirm step
- All patient data synthetic — SyntheticBanner visible on every screen

---

## Synthetic data notice

All patient names, claim numbers, clinical details, and personal information in this demo are entirely fictitious and generated for demonstration purposes only. This is not a production clinical system. No real patient data was used at any point.

---

## Running locally

```bash
git clone https://github.com/iNVISIBLExtanx/RehabOS.git
cd RehabOS
npm install
cp .env.example .env.local   # fill in your Anthropic + Supabase keys
npm run dev                  # http://localhost:3000
```

The DB Explorer tab works without any API keys — pglite runs entirely in the browser.
The AI Clinical Notes tab requires `ANTHROPIC_API_KEY` in `.env.local`.
