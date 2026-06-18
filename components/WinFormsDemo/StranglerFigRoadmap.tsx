"use client";

// 4-step roadmap from docs/WINFORMS_CONCEPTS.md §"Strangler Fig Pattern"
// Steps, code snippets, and ordering sourced verbatim from that file.

interface RoadmapStep {
  number: number;
  title: string;
  timeline: string;
  description: string;
  code: string;
  language: string;
  outcome: string;
}

const STEPS: RoadmapStep[] = [
  {
    number: 1,
    title: "Deploy YARP Facade",
    timeline: "Week 1",
    description: "Add ASP.NET Core + YARP reverse proxy in front of the existing WinForms app. All traffic forwards to legacy. Zero functional change — users cannot tell anything happened.",
    language: "json",
    code: `// appsettings.json — YARP config
{
  "ReverseProxy": {
    "Routes": {
      "legacy-catch-all": {
        "ClusterId": "legacy",
        "Match": { "Path": "{**catch-all}" }
      }
    },
    "Clusters": {
      "legacy": {
        "Destinations": {
          "legacy/destination1": {
            "Address": "http://legacy-app:8080/"
          }
        }
      }
    }
  }
}`,
    outcome: "Proxy live. Legacy untouched. New modules can now intercept specific routes.",
  },
  {
    number: 2,
    title: "Replace First Module — AI Clinical Notes",
    timeline: "Month 1–2",
    description: "Add a Blazor/Next.js route for /notes before the legacy catch-all. WSIB clinical documentation is the highest pain point (20–40 min per note) and lowest risk to pilot.",
    language: "json",
    code: `// Add BEFORE the legacy-catch-all route
"new-soap-route": {
  "ClusterId": "new-blazor",
  "Match": { "Path": "/notes/{**remainder}" }
},
// Legacy still handles everything else
"legacy-catch-all": { ... }`,
    outcome: "Clinicians access AI-assisted SOAP notes at /notes. All other screens unchanged.",
  },
  {
    number: 3,
    title: "Expand Module by Module",
    timeline: "Month 3–18",
    description: "Migrate modules in order of value vs risk. Each new route intercepts a path prefix; YARP routes to the new service. The legacy system handles everything else until explicitly replaced.",
    language: "text",
    code: `Replacement order (value ÷ risk):

1. /notes      AI clinical documentation  ← highest pain
2. /billing    Invoice generation + WSIB submission
3. /scheduling Appointment management
4. /clients    Client records + case management
5. /reports    WSIB reporting + analytics

Each module: new route added to YARP → legacy catch-all
shrinks → no downtime at any step.`,
    outcome: "System modernises incrementally. Clinicians never lose access.",
  },
  {
    number: 4,
    title: "Decommission Legacy",
    timeline: "Month 18–36",
    description: "When the YARP routing table has zero legacy routes, the WinForms app is unreachable. Remove YARP, remove the legacy deployment. No big-bang cutover — the last legacy route just disappears.",
    language: "text",
    code: `Before:    YARP → [new modules] + legacy catch-all
After:     YARP → [new modules only]
Final:     Remove YARP, direct traffic to new system

Total: 18–36 months for a system FunctionAbility's size.
Zero downtime. Zero forced cutover. Zero data migration risk.`,
    outcome: "Legacy decommissioned. Full modern stack. Clinicians experienced no disruption.",
  },
];

export function StranglerFigRoadmap() {
  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-1">
          Strangler Fig Modernisation Roadmap
        </h4>
        <p className="text-xs text-gray-500">
          WinForms → Blazor/Next.js — incremental replacement, zero downtime, 18–36 months.
          The system never stops running; clinicians never lose access.
        </p>
      </div>

      <div className="relative">
        {/* Vertical timeline connector */}
        <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-green-200" />

        <div className="space-y-4">
          {STEPS.map((step) => (
            <div key={step.number} className="relative flex gap-4">
              {/* Step circle */}
              <div className="shrink-0 w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold z-10">
                {step.number}
              </div>

              <div className="flex-1 rounded-lg border border-gray-200 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">{step.title}</span>
                  <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">{step.timeline}</span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">{step.description}</p>

                {/* Code snippet */}
                <pre className="text-xs font-mono bg-gray-900 text-green-400 rounded p-3 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                  {step.code}
                </pre>

                {/* Outcome */}
                <div className="flex items-start gap-2 rounded bg-green-50 border border-green-200 px-3 py-2">
                  <span className="text-green-600 text-sm shrink-0">✓</span>
                  <p className="text-xs text-green-700">{step.outcome}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
        <strong>Why not a rewrite?</strong> A big-bang rewrite requires running two systems in parallel,
        a forced cutover date, and carries full risk of data migration failures.
        The Strangler Fig pattern eliminates all three — the new system grows around the old one
        until the old one can be safely removed.
      </div>
    </div>
  );
}
