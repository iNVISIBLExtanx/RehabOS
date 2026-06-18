"use client";

import { useState } from "react";
import { TabNav } from "./TabNav";
import { TabErrorBoundary } from "./TabErrorBoundary";
import { PipelineContainer } from "@/components/ClinicalPipeline/PipelineContainer";
import { DBExplorerContainer } from "@/components/DBExplorer/DBExplorerContainer";
import { WinFormsShell } from "@/components/WinFormsDemo/WinFormsShell";

export interface Tab {
  id: string;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: "clinical",  label: "AI Clinical Notes",      icon: "🩺" },
  { id: "db",        label: "DB & SQL Explorer",       icon: "🗄️" },
  { id: "winforms",  label: "WinForms — I get it",    icon: "🖥️" },
];

const TAB_CONTEXT: Record<string, { headline: string; subtext: string }> = {
  clinical: {
    headline: "The bottleneck: 20–40 minutes of manual documentation after every visit",
    subtext:
      "OT/PT clinicians at FunctionAbility travel to clients' homes and schools. After each visit they write SOAP notes from memory, fill WSIB Form 8 or Form 26 by hand, then look up the right billing code. This pipeline turns a raw dictation into a reviewed, editable draft — in seconds.",
  },
  db: {
    headline: "The database is the most valuable thing in the system",
    subtext:
      "Tom mentioned the DB has grown and queries have become complex. I spent time understanding the schema before writing any code. Below is an interactive ERD of the 13-table WSIB rehab schema I designed, plus a live SQL runner with 6 senior queries — including a T-SQL note on each one for the SQL Server equivalent.",
  },
  winforms: {
    headline: "Will I get bored with WinForms? No — and here's why.",
    subtext:
      "The concern was fair: modern-stack developer, old tech stack. But I learn tech for the business, not the other way around. The WSIB billing rules, the clinical workflows, the Form 8/26 distinction — that's what takes months to understand. VB.NET syntax takes a week. This tab shows I've already started: a pixel-accurate WinForms MDI replica, the WinForms ↔ React concept map, and a Strangler Fig roadmap for teams who want to modernise without a big-bang rewrite.",
  },
};

export function TabShell() {
  const [activeTab, setActiveTab] = useState("clinical");
  const ctx = TAB_CONTEXT[activeTab];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Context hero — addresses Tom's concerns directly above each tab */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-widest mb-1">
                Portfolio demo for FunctionAbility Rehabilitation Services
              </p>
              <h2 className="text-base font-bold text-gray-900 mb-1">{ctx.headline}</h2>
              <p className="text-sm text-gray-500 leading-relaxed max-w-3xl">{ctx.subtext}</p>
            </div>
            <a
              href="https://github.com/iNVISIBLExtanx/RehabOS"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-xs text-gray-400 hover:text-gray-600 underline whitespace-nowrap mt-1"
            >
              Source on GitHub →
            </a>
          </div>
        </div>
      </div>

      <TabNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {activeTab === "clinical" && (
          <TabErrorBoundary tabName="AI Clinical Notes">
            <PipelineContainer />
          </TabErrorBoundary>
        )}
        {activeTab === "db" && (
          <TabErrorBoundary tabName="DB Explorer">
            <DBExplorerContainer />
          </TabErrorBoundary>
        )}
        {activeTab === "winforms" && (
          <TabErrorBoundary tabName="WinForms Demo">
            <WinFormsShell />
          </TabErrorBoundary>
        )}
      </main>
    </div>
  );
}
