"use client";

import { useState } from "react";
import { getPglite } from "@/lib/pglite";

interface ExplainViewerProps {
  sql: string;
}

export function ExplainViewer({ sql }: ExplainViewerProps) {
  const [plan, setPlan] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runExplain() {
    if (!sql.trim()) return;
    setIsRunning(true);
    setError(null);
    setPlan(null);

    try {
      const db = await getPglite();
      const res = await db.query(`EXPLAIN ANALYZE ${sql.trim()}`);
      const lines = (res.rows as Record<string, string>[])
        .map((r) => Object.values(r)[0])
        .join("\n");
      setPlan(lines);
    } catch (err) {
      setError(err instanceof Error ? err.message : "EXPLAIN failed");
    } finally {
      setIsRunning(false);
    }
  }

  if (!sql.trim()) return null;

  return (
    <div className="space-y-2">
      <button
        onClick={runExplain}
        disabled={isRunning}
        className="text-xs px-3 py-1.5 rounded border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-40"
      >
        {isRunning ? "Running EXPLAIN…" : "EXPLAIN ANALYZE"}
      </button>

      {error && (
        <div className="text-xs text-red-600 font-mono bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}

      {plan && (
        <pre className="text-xs font-mono bg-gray-900 text-green-400 rounded-lg p-3 overflow-x-auto leading-relaxed whitespace-pre-wrap">
          {plan}
        </pre>
      )}
    </div>
  );
}
