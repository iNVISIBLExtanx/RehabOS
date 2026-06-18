# /new-query

Add a new SQL query to the DB Explorer query library.

## Usage
```
/new-query "[query name]" "[business description]"
```

## What This Command Does
1. Writes a new SQL query entry to `/components/DBExplorer/QueryLibrary.tsx`
2. Tests the query against the pglite in-browser schema in `/data/pglite-seed.sql`
3. Adds a plain-English caption explaining what the query demonstrates

## Rules For This Command
- Every query must use PostgreSQL syntax (compatible with pglite)
- Queries MUST demonstrate at least one of: CTE, window function, recursive CTE, conditional aggregation, or subquery
- Include a T-SQL variation note if applicable (for Tom's SQL Server background)
- The query must run successfully against the demo seed data
- Add a `complexity` badge: "Intermediate" | "Senior" | "Expert"
- Add a `demonstrates` array: e.g. ["CTE", "Window Function", "Date Math"]

## Query Library Format
Each entry in `QueryLibrary.tsx` should follow:
```typescript
{
  id: string,
  name: string,
  description: string,         // 1 sentence for Tom: what business question this answers
  sql: string,                 // The actual query
  complexity: "Intermediate" | "Senior" | "Expert",
  demonstrates: string[],      // SQL features used
  tsql_note?: string           // Optional: T-SQL equivalent or syntax note
}
```

## The 6 Required Queries (already in library — add to these)
1. AR Aging Buckets — CTE + CASE (Expert)
2. Clinician Utilization Ranking — Window RANK() (Senior)
3. Running Revenue by Service Type — SUM() OVER with ROWS UNBOUNDED (Expert)
4. No-Show Rate by Clinician — Conditional aggregation FILTER (Intermediate)
5. Month-over-Month Revenue Change — LAG() window function (Senior)
6. Recursive Referral Chain — WITH RECURSIVE (Expert)
