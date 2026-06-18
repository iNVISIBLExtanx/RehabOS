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
  { id: "clinical",  label: "AI Clinical Notes",  icon: "🩺" },
  { id: "db",        label: "DB & SQL Explorer",   icon: "🗄️" },
  { id: "winforms",  label: "WinForms → Web",      icon: "🖥️" },
];

export function TabShell() {
  const [activeTab, setActiveTab] = useState("clinical");

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
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
