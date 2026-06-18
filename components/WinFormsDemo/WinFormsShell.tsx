"use client";

import { useState } from "react";
import { DataGridView } from "./DataGridView";
import { ConceptMapper } from "./ConceptMapper";
import { StranglerFigRoadmap } from "./StranglerFigRoadmap";

type WinTab = "datagrid" | "concepts" | "roadmap";

const WIN_TABS: { id: WinTab; label: string }[] = [
  { id: "datagrid", label: "Client List (DataGridView)" },
  { id: "concepts", label: "WinForms → React" },
  { id: "roadmap",  label: "Strangler Fig Roadmap" },
];

// MDI background #7b9bd0 from WINFORMS_CONCEPTS.md §"MDI Shell Architecture"
export function WinFormsShell() {
  const [activeTab, setActiveTab] = useState<WinTab>("datagrid");
  const [windowTitle] = useState("FunctionAbility Rehabilitation — Client Management");

  return (
    // MDI container background — #7b9bd0 per WINFORMS_CONCEPTS.md
    <div className="rounded-lg overflow-hidden border border-gray-400 shadow-lg bg-[#7b9bd0]">
      {/* MDI title bar context label */}
      <div className="px-3 py-1 bg-[#0a246a] text-white text-xs flex items-center gap-2">
        <span className="text-gray-300">MDI Shell ·</span>
        <span className="font-medium">FunctionAbility Rehab System v4.2 [WinForms replica]</span>
      </div>

      {/* Child window — floats inside MDI */}
      <div className="m-3 rounded border border-[#aca899] shadow-md overflow-hidden bg-white">
        {/* Title bar — XP style */}
        <div className="flex items-center justify-between px-2 py-1 bg-gradient-to-r from-[#0a246a] to-[#3a6ea8]">
          <div className="flex items-center gap-2">
            {/* App icon placeholder */}
            <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center text-[8px] text-[#0a246a] font-bold">FA</div>
            <span className="text-white text-xs font-medium">{windowTitle}</span>
          </div>
          {/* XP window controls — decorative */}
          <div className="flex gap-1">
            <button className="w-5 h-4 bg-[#ece9d8] border border-[#aca899] text-[#0a246a] text-[10px] flex items-center justify-center hover:bg-[#dde9f8]">_</button>
            <button className="w-5 h-4 bg-[#ece9d8] border border-[#aca899] text-[#0a246a] text-[10px] flex items-center justify-center hover:bg-[#dde9f8]">□</button>
            <button className="w-5 h-4 bg-[#c75050] border border-[#a04040] text-white text-[10px] flex items-center justify-center hover:bg-[#e06060]">✕</button>
          </div>
        </div>

        {/* MenuStrip — #ece9d8 background per WINFORMS_CONCEPTS.md */}
        <div className="flex items-center gap-0 px-1 py-0.5 bg-[#ece9d8] border-b border-[#aca899] text-xs">
          {["File", "Edit", "View", "Clients", "Reports", "WSIB", "Tools", "Help"].map((menu) => (
            <button key={menu}
              className="px-2 py-0.5 hover:bg-[#316ac5] hover:text-white rounded-sm transition-colors">
              {menu}
            </button>
          ))}
        </div>

        {/* ToolStrip — icon toolbar */}
        <div className="flex items-center gap-0.5 px-2 py-1 bg-[#ece9d8] border-b border-[#aca899]">
          {[
            { icon: "📄", label: "New Client" },
            { icon: "💾", label: "Save" },
            { icon: "🖨️", label: "Print" },
          ].map(({ icon, label }) => (
            <button key={label} title={label}
              className="flex items-center gap-1 px-2 py-0.5 text-xs border border-transparent hover:border-[#aca899] hover:bg-white rounded-sm">
              <span>{icon}</span>
              <span className="text-gray-600">{label}</span>
            </button>
          ))}
          <span className="mx-1 text-[#aca899]">|</span>
          {[
            { icon: "🔍", label: "Search" },
            { icon: "🔄", label: "Refresh" },
          ].map(({ icon, label }) => (
            <button key={label} title={label}
              className="flex items-center gap-1 px-2 py-0.5 text-xs border border-transparent hover:border-[#aca899] hover:bg-white rounded-sm">
              <span>{icon}</span>
              <span className="text-gray-600">{label}</span>
            </button>
          ))}
        </div>

        {/* TabControl with TabPage children — WINFORMS_CONCEPTS.md */}
        <div className="bg-[#ece9d8] border-b border-[#aca899] flex gap-0 px-2 pt-1">
          {WIN_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                "px-4 py-1 text-xs border border-[#aca899] -mb-px transition-colors rounded-t",
                activeTab === tab.id
                  ? "bg-white border-b-white text-[#0a246a] font-semibold z-10 relative"
                  : "bg-[#d4d0c8] text-gray-600 hover:bg-[#e8e4dc]",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content area */}
        <div className="bg-white p-4 min-h-[400px]">
          {activeTab === "datagrid" && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                <strong>DataGridView</strong> bound to synthetic client data from FunctionAbility's WSIB rehab schema.
                Click a row to select it (XP highlight: <span className="bg-[#316ac5] text-white px-1 rounded">like this</span>).
              </p>
              <DataGridView />
              <div className="text-xs text-gray-400 space-y-1 mt-2">
                <p><strong>VB.NET equivalent:</strong></p>
                <pre className="bg-gray-50 border border-gray-200 rounded px-3 py-2 font-mono text-gray-600 text-[10px]">{`DataGridView1.DataSource = bindingSource1
DataGridView1.AutoGenerateColumns = True
DataGridView1.SelectionMode = DataGridViewSelectionMode.FullRowSelect
DataGridView1.AllowUserToAddRows = False`}</pre>
              </div>
            </div>
          )}
          {activeTab === "concepts" && <ConceptMapper />}
          {activeTab === "roadmap"  && <StranglerFigRoadmap />}
        </div>

        {/* StatusStrip — two panels: left context, right record count */}
        <div className="flex items-center justify-between px-2 py-1 bg-[#ece9d8] border-t border-[#aca899] text-xs text-gray-600">
          <div className="flex items-center gap-3">
            <span className="border-r border-[#aca899] pr-3">Ready</span>
            <span>{activeTab === "datagrid" ? "Showing all active clients" : activeTab === "concepts" ? "WinForms → React concept map" : "Migration roadmap"}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="border-l border-[#aca899] pl-3">Records: 6</span>
            <span className="border-l border-[#aca899] pl-3">sarah.mitchell@demo · FunctionAbility</span>
          </div>
        </div>
      </div>
    </div>
  );
}
