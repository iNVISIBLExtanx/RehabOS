"use client";

import { useState } from "react";
import { ERDDiagram } from "./ERDDiagram";
import { SQLRunner } from "./SQLRunner";
import { QueryLibrary, type QueryEntry } from "./QueryLibrary";
import { ExplainViewer } from "./ExplainViewer";

type DBTab = "erd" | "sql";

export function DBExplorerContainer() {
  const [activeTab, setActiveTab] = useState<DBTab>("erd");
  const [selectedQuery, setSelectedQuery] = useState<QueryEntry | null>(null);
  const [activeSql, setActiveSql] = useState("");

  function handleQuerySelect(query: QueryEntry) {
    setSelectedQuery(query);
    setActiveSql(query.sql);
    setActiveTab("sql");
  }

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {(["erd", "sql"] as DBTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={[
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === tab
                ? "border-green-600 text-green-700"
                : "border-transparent text-gray-500 hover:text-gray-700",
            ].join(" ")}
          >
            {tab === "erd" ? "🗺 Interactive ERD" : "⚡ SQL Runner"}
          </button>
        ))}
      </div>

      {activeTab === "erd" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-700">13-Table WSIB Rehabilitation Schema</h3>
              <p className="text-xs text-gray-400 mt-0.5">Scroll to zoom · drag to pan · click a node to inspect</p>
            </div>
            <button
              onClick={() => setActiveTab("sql")}
              className="text-xs px-3 py-1.5 rounded border border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700 transition-colors"
            >
              Open SQL Runner →
            </button>
          </div>
          <ERDDiagram />
        </div>
      )}

      {activeTab === "sql" && (
        <div className="grid grid-cols-[280px_1fr] gap-4">
          {/* Query library sidebar */}
          <div className="overflow-y-auto max-h-[720px] pr-1">
            <QueryLibrary
              onSelect={handleQuerySelect}
              selectedId={selectedQuery?.id ?? null}
            />
          </div>

          {/* SQL editor + results */}
          <div className="space-y-4">
            {selectedQuery && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">{selectedQuery.name}</span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-500">{selectedQuery.description}</span>
                </div>
                {selectedQuery.tsql_note && (
                  <p className="text-xs text-blue-600 mt-1">
                    📋 T-SQL note: {selectedQuery.tsql_note}
                  </p>
                )}
              </div>
            )}

            <SQLRunner initialSql={activeSql} />

            <ExplainViewer sql={activeSql} />
          </div>
        </div>
      )}
    </div>
  );
}
