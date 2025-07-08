"use client";

import { useState, useEffect } from "react";

interface LogEntry {
  name: string;
  logs: string;
}

export default function LogPage() {
  const [logs, setLogs] = useState<LogEntry>({ name: "", logs: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("https://raise.logi-green.com/log/getlogs");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: LogEntry = await response.json();
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs().catch((err) => {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setLoading(false);
    });
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-slate-800">
              Agent Control Tower Logs
            </h1>
            <p className="text-lg text-slate-600">
              Real-time logs from the control tower agent
            </p>
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white shadow-md transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {loading ? "Refreshing..." : "Refresh Logs"}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-6 shadow-lg">
              <div className="flex items-center">
                <div className="mr-3 text-red-500">⚠️</div>
                <div>
                  <h3 className="font-semibold text-red-800">
                    Error Loading Logs
                  </h3>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Logs Display */}
          <div className="space-y-6">
            {!logs.logs && !loading && !error && (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
                <p className="text-slate-500">No logs available</p>
              </div>
            )}

            {logs.logs && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-200 bg-slate-100 px-6 py-4">
                  <h3 className="flex items-center font-semibold text-slate-800">
                    <span className="mr-2">📋</span>
                    {logs.name || "Agent Logs"}
                  </h3>
                </div>
                <div className="p-6">
                  <pre className="max-h-96 overflow-x-auto overflow-y-auto rounded-lg bg-slate-50 p-4 text-sm whitespace-pre-wrap text-slate-700">
                    {logs.logs || "No logs available"}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-slate-600">Loading logs...</p>
            </div>
          )}

          {/* Auto-refresh info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Logs are displayed in real-time. Click{" "}
              <kbd className="rounded bg-slate-200 px-2 py-1 text-xs">
                Refresh Logs
              </kbd>{" "}
              to update manually
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
