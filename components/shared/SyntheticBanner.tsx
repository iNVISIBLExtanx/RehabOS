// Sticky banner required on every screen — CLAUDE.md rule: "No real PHI ever, banner always visible"
export function SyntheticBanner() {
  return (
    <div className="sticky top-0 z-50 w-full bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-center">
      <p className="text-xs font-semibold text-amber-700 tracking-wide">
        Demo — Synthetic Data Only &nbsp;·&nbsp; All patient names and clinical details are fictitious
      </p>
    </div>
  );
}
