"use client";

import { useState, useEffect, useRef } from "react";
import { getPglite } from "@/lib/pglite";

interface QueryResult {
  columns: string[];
  rows: unknown[][];
  rowCount: number;
  durationMs: number;
}

interface SQLRunnerProps {
  initialSql?: string;
}

export function SQLRunner({ initialSql = "" }: SQLRunnerProps) {
  const [sql, setSql] = useState(initialSql);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setSql(initialSql);
  }, [initialSql]);

  // Initialise pglite on mount — loads schema + seed from public/pglite-seed.sql
  useEffect(() => {
    getPglite().then(() => setDbReady(true)).catch(() => setDbReady(false));
  }, []);

  async function runQuery() {
    if (!sql.trim() || isRunning) return;
    setIsRunning(true);
    setError(null);
    setResult(null);

    try {
      const db = await getPglite();
      const start = performance.now();
      const res = await db.query(sql.trim());
      const durationMs = Math.round(performance.now() - start);

      const fields = (res.fields as { name: string }[]) ?? [];
      const columns = fields.map((f) => f.name);
      const rows = (res.rows as Record<string, unknown>[]).map((row) =>
        columns.map((col) => row[col])
      );

      setResult({ columns, rows, rowCount: rows.length, durationMs });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setIsRunning(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      runQuery();
    }
  }

  function formatCell(val: unknown): string {
    if (val === null || val === undefined) return "NULL";
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={6}
          className="w-full rounded-lg border border-gray-200 p-3 text-sm font-mono text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="SELECT * FROM clients LIMIT 10;"
          disabled={!dbReady || isRunning}
        />
        <div className="absolute bottom-2 right-2 flex items-center gap-2">
          {!dbReady && (
            <span className="text-xs text-amber-500">Loading in-browser DB…</span>
          )}
          <button
            onClick={runQuery}
            disabled={!dbReady || isRunning || !sql.trim()}
            className="px-3 py-1 rounded text-xs font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-40 transition-colors"
          >
            {isRunning ? "Running…" : "Run ⌘↵"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 font-mono">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{result.rowCount} row{result.rowCount !== 1 ? "s" : ""}</span>
            <span>·</span>
            <span>{result.durationMs}ms</span>
          </div>

          {result.columns.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    {result.columns.map((col) => (
                      <th key={col} className="px-3 py-2 text-left font-semibold text-gray-600 whitespace-nowrap border-b border-gray-200">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.rows.map((row, ri) => (
                    <tr key={ri} className="hover:bg-gray-50">
                      {row.map((cell, ci) => (
                        <td key={ci} className={`px-3 py-1.5 font-mono whitespace-nowrap max-w-xs truncate ${cell === null || cell === undefined ? "text-gray-300 italic" : "text-gray-700"}`}>
                          {formatCell(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">Query executed successfully — no rows returned.</p>
          )}
        </div>
      )}
    </div>
  );
}
