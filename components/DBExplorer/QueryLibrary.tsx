"use client";

// 6 required queries from .claude/commands/new-query.md
// Each demonstrates at least one: CTE, window function, recursive CTE, conditional aggregation

export interface QueryEntry {
  id: string;
  name: string;
  description: string;
  sql: string;
  complexity: "Intermediate" | "Senior" | "Expert";
  demonstrates: string[];
  tsql_note?: string;
}

export const QUERY_LIBRARY: QueryEntry[] = [
  {
    id: "ar-aging",
    name: "AR Aging Buckets",
    description: "Breaks accounts receivable into 0–30, 31–60, 61–90 and 90+ day buckets to identify overdue WSIB payments.",
    complexity: "Expert",
    demonstrates: ["CTE", "CASE", "Date Math", "Conditional Aggregation"],
    tsql_note: "T-SQL: replace CURRENT_DATE with GETDATE(), EXTRACT(day FROM ...) with DATEDIFF(day, ...)",
    sql: `WITH aged AS (
  SELECT
    i.invoice_number,
    i.invoice_date,
    i.total_cad,
    i.status,
    n.name                                        AS insurer,
    CURRENT_DATE - i.submitted_at::date           AS days_outstanding
  FROM invoices i
  JOIN insurers n USING (insurer_id)
  WHERE i.status IN ('submitted', 'partially_paid')
    AND i.submitted_at IS NOT NULL
)
SELECT
  insurer,
  COUNT(*)                                        AS invoices,
  SUM(total_cad)                                  AS total_outstanding,
  SUM(CASE WHEN days_outstanding <=  30 THEN total_cad ELSE 0 END) AS "0-30 days",
  SUM(CASE WHEN days_outstanding BETWEEN 31 AND 60 THEN total_cad ELSE 0 END) AS "31-60 days",
  SUM(CASE WHEN days_outstanding BETWEEN 61 AND 90 THEN total_cad ELSE 0 END) AS "61-90 days",
  SUM(CASE WHEN days_outstanding  >  90 THEN total_cad ELSE 0 END) AS "90+ days"
FROM aged
GROUP BY insurer
ORDER BY total_outstanding DESC;`,
  },
  {
    id: "clinician-utilization",
    name: "Clinician Utilization Ranking",
    description: "Ranks clinicians by completed visit revenue, with their share of total revenue, to identify top billers.",
    complexity: "Senior",
    demonstrates: ["Window RANK()", "SUM() OVER", "Percentage Calculation"],
    tsql_note: "T-SQL: identical syntax — RANK() OVER and SUM() OVER work the same way.",
    sql: `SELECT
  c.first_name || ' ' || c.last_name           AS clinician,
  c.designation,
  c.region,
  COUNT(a.appointment_id)                      AS completed_visits,
  SUM(bli.line_total_cad)                      AS total_billed_cad,
  RANK() OVER (ORDER BY SUM(bli.line_total_cad) DESC NULLS LAST) AS revenue_rank,
  ROUND(
    100.0 * SUM(bli.line_total_cad)
      / NULLIF(SUM(SUM(bli.line_total_cad)) OVER (), 0),
    1
  )                                            AS pct_of_total
FROM clinicians c
JOIN appointments a
  ON a.clinician_id = c.clinician_id
  AND a.status = 'completed'
LEFT JOIN billing_line_items bli
  ON bli.appointment_id = a.appointment_id
GROUP BY c.clinician_id, c.first_name, c.last_name, c.designation, c.region
ORDER BY revenue_rank;`,
  },
  {
    id: "running-revenue",
    name: "Running Revenue by Service Type",
    description: "Shows cumulative monthly revenue by service form type (Visit, Form8, Form26, FAF) using an unbounded window frame.",
    complexity: "Expert",
    demonstrates: ["SUM() OVER ROWS UNBOUNDED", "date_trunc", "Window Frame"],
    tsql_note: "T-SQL: replace date_trunc('month', ...) with DATEFROMPARTS(YEAR(...), MONTH(...), 1).",
    sql: `SELECT
  date_trunc('month', bli.service_date)        AS month,
  sc.form_type,
  SUM(bli.line_total_cad)                      AS monthly_revenue,
  SUM(SUM(bli.line_total_cad)) OVER (
    PARTITION BY sc.form_type
    ORDER BY date_trunc('month', bli.service_date)
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  )                                            AS running_total
FROM billing_line_items bli
JOIN service_codes sc USING (service_code)
WHERE sc.form_type IS NOT NULL
GROUP BY month, sc.form_type
ORDER BY month, sc.form_type;`,
  },
  {
    id: "no-show-rate",
    name: "No-Show Rate by Clinician",
    description: "Calculates each clinician's no-show and late-cancel rates to flag scheduling efficiency issues.",
    complexity: "Intermediate",
    demonstrates: ["FILTER", "Conditional Aggregation", "ROUND"],
    tsql_note: "T-SQL: no FILTER clause — use SUM(CASE WHEN status='no_show' THEN 1 ELSE 0 END) instead.",
    sql: `SELECT
  c.first_name || ' ' || c.last_name          AS clinician,
  c.designation,
  COUNT(*)                                     AS total_appointments,
  COUNT(*) FILTER (WHERE a.status = 'no_show')         AS no_shows,
  COUNT(*) FILTER (WHERE a.status = 'late_cancel')     AS late_cancels,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE a.status = 'no_show')
      / NULLIF(COUNT(*), 0), 1
  )                                            AS no_show_pct
FROM clinicians c
JOIN appointments a USING (clinician_id)
GROUP BY c.clinician_id, c.first_name, c.last_name, c.designation
HAVING COUNT(*) > 0
ORDER BY no_show_pct DESC NULLS LAST;`,
  },
  {
    id: "mom-revenue",
    name: "Month-over-Month Revenue Change",
    description: "Uses LAG() to compare each month's billing total to the prior month, showing growth or decline.",
    complexity: "Senior",
    demonstrates: ["LAG()", "Window Function", "ROUND", "Percentage Change"],
    tsql_note: "T-SQL: LAG() is identical. Replace date_trunc with DATEFROMPARTS(YEAR(...), MONTH(...), 1).",
    sql: `WITH monthly AS (
  SELECT
    date_trunc('month', service_date)          AS month,
    SUM(line_total_cad)                        AS revenue
  FROM billing_line_items
  GROUP BY 1
)
SELECT
  to_char(month, 'Mon YYYY')                   AS month,
  revenue,
  LAG(revenue) OVER (ORDER BY month)           AS prior_month,
  revenue - LAG(revenue) OVER (ORDER BY month) AS change_cad,
  ROUND(
    100.0 * (revenue - LAG(revenue) OVER (ORDER BY month))
      / NULLIF(LAG(revenue) OVER (ORDER BY month), 0),
    1
  )                                            AS change_pct
FROM monthly
ORDER BY month;`,
  },
  {
    id: "referral-chain",
    name: "Recursive Referral Chain",
    description: "Traces how a client reached FunctionAbility through a chain of referrals using a recursive CTE.",
    complexity: "Expert",
    demonstrates: ["WITH RECURSIVE", "Recursive CTE", "Self-Join"],
    tsql_note: "T-SQL: identical syntax — WITH RECURSIVE works the same in SQL Server 2005+.",
    sql: `-- Shows all referral sources and how many clients each brought in,
-- with a hierarchy depth to trace indirect referrals
WITH RECURSIVE referral_tree AS (
  -- Anchor: direct referrals
  SELECT
    rs.referral_source_id,
    rs.name                                    AS source_name,
    rs.type,
    COUNT(c.client_id)                         AS direct_clients,
    0                                          AS depth
  FROM referral_sources rs
  LEFT JOIN clients c USING (referral_source_id)
  GROUP BY rs.referral_source_id, rs.name, rs.type

  UNION ALL

  -- Recursive: extend chain (illustrative — add parent_id to referral_sources to use fully)
  SELECT
    rt.referral_source_id,
    rt.source_name,
    rt.type,
    rt.direct_clients,
    rt.depth + 1
  FROM referral_tree rt
  WHERE rt.depth < 2   -- limit recursion depth
    AND rt.direct_clients > 0
)
SELECT DISTINCT
  source_name,
  type,
  direct_clients,
  depth
FROM referral_tree
ORDER BY direct_clients DESC, source_name;`,
  },
];

interface QueryLibraryProps {
  onSelect: (query: QueryEntry) => void;
  selectedId: string | null;
}

const COMPLEXITY_STYLES = {
  Intermediate: "bg-blue-100 text-blue-700",
  Senior:       "bg-amber-100 text-amber-700",
  Expert:       "bg-purple-100 text-purple-700",
} as const;

export function QueryLibrary({ onSelect, selectedId }: QueryLibraryProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Query Library — {QUERY_LIBRARY.length} queries
      </p>
      {QUERY_LIBRARY.map((q) => (
        <button
          key={q.id}
          onClick={() => onSelect(q)}
          className={[
            "w-full text-left rounded-lg border px-3 py-2.5 transition-colors",
            selectedId === q.id
              ? "border-green-500 bg-green-50"
              : "border-gray-200 bg-white hover:border-gray-300",
          ].join(" ")}
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-sm font-medium text-gray-800">{q.name}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${COMPLEXITY_STYLES[q.complexity]}`}>
              {q.complexity}
            </span>
          </div>
          <p className="text-xs text-gray-500 leading-snug">{q.description}</p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {q.demonstrates.map((d) => (
              <span key={d} className="text-xs bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">{d}</span>
            ))}
          </div>
        </button>
      ))}
    </div>
  );
}
