"use client";

// Concept mapping from docs/WINFORMS_CONCEPTS.md §"The Core Paradigm"
// Tom quotes sourced verbatim from WINFORMS_CONCEPTS.md §"What Tom Wants to Hear"

interface ConceptRow {
  concept: string;
  winforms: string;
  react: string;
  note?: string;
}

const CONCEPTS: ConceptRow[] = [
  { concept: "UI component",    winforms: "Form / UserControl",           react: "Component function",              note: "Same tree-of-components model" },
  { concept: "Markup/layout",   winforms: ".Designer.vb (auto-generated)",react: "JSX",                             note: "Both describe UI structure declaratively" },
  { concept: "State",           winforms: "Private fields on the Form",   react: "useState / useReducer",           note: "Local to the component" },
  { concept: "Event binding",   winforms: "Handles Button1.Click",        react: "onClick={handler}",               note: "Same event-driven model, different syntax" },
  { concept: "Side effects",    winforms: "Form_Load / Shown",            react: "useEffect",                       note: "Run after render" },
  { concept: "Data binding",    winforms: "DataSource → BindingSource",   react: "props / React state",             note: "One-way or two-way binding" },
  { concept: "Grid component",  winforms: "DataGridView",                 react: "<table> or data-grid lib",        note: "See DataGridView replica below" },
  { concept: "Tab container",   winforms: "TabControl + TabPage",         react: "Tab component + conditional render", note: "Same UX, different mechanism" },
  { concept: "Layout",          winforms: "Dock, Anchor, TableLayoutPanel",react: "Flexbox / CSS Grid",             note: "Both are constraint-based" },
  { concept: "Modal/dialog",    winforms: "Form2.ShowDialog()",           react: "<Modal> conditional render",      note: "Controlled by state instead of imperative call" },
  { concept: "MDI pattern",     winforms: "IsMdiContainer + MdiParent",   react: "Router + persistent layout shell", note: "Multi-window → multi-route" },
  { concept: "Validation",      winforms: "ErrorProvider + Validating",   react: "Zod / react-hook-form",           note: "Schema-first vs event-first" },
  { concept: "Async ops",       winforms: "BackgroundWorker / Async Task",react: "async/await + useEffect",         note: "Both handle async UI updates" },
  { concept: "Dependency inject",winforms: "Constructor params / locator",react: "Context / props",                 note: "Same principle, different runtime" },
];

// Verbatim quotes from WINFORMS_CONCEPTS.md §"What Tom Wants to Hear"
const TOM_QUOTES = [
  "WinForms is a well-understood, data-bound paradigm. DataGridView + BindingSource is the same event-driven model as React state — different syntax, same architecture.",
  "The business logic in your VB.NET code is more valuable than the UI framework. I'd learn the billing rules first, then the controls second.",
  "My learning curve from TypeScript to VB.NET/C# is measured in weeks, not months — shared static typing, OOP, and a managed runtime. The .NET Upgrade Assistant handles the mechanical parts.",
];

export function ConceptMapper() {
  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-1">
          WinForms → React Concept Mapping
        </h4>
        <p className="text-xs text-gray-500">
          Same mental model — event-driven UI trees + state changes. Different syntax, not different thinking.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-gray-600 border-b border-gray-200 w-36">Concept</th>
              <th className="px-3 py-2 text-left font-semibold text-[#0a246a] border-b border-gray-200 w-52">WinForms (VB.NET)</th>
              <th className="px-3 py-2 text-left font-semibold text-green-700 border-b border-gray-200 w-52">React (TypeScript)</th>
              <th className="px-3 py-2 text-left font-semibold text-gray-500 border-b border-gray-200">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {CONCEPTS.map((row, i) => (
              <tr key={row.concept} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-3 py-2 font-medium text-gray-700">{row.concept}</td>
                <td className="px-3 py-2 font-mono text-[#0a246a] bg-[#f5f3ff]">{row.winforms}</td>
                <td className="px-3 py-2 font-mono text-green-700 bg-green-50">{row.react}</td>
                <td className="px-3 py-2 text-gray-500">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tom quotes */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">For Tom — IT Director (SQL Server / VB.NET background)</p>
        {TOM_QUOTES.map((quote, i) => (
          <blockquote key={i} className="border-l-4 border-green-500 pl-3 py-1 text-sm text-gray-700 bg-green-50 rounded-r">
            {quote}
          </blockquote>
        ))}
      </div>
    </div>
  );
}
