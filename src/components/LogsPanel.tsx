import { useState, useEffect, useCallback } from "react";
import { gatewayClient } from "../gateway/client";
import "./Panels.css";
import "./LogsPanel.css";

export function LogsPanel() {
  const [logs, setLogs] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(100);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await gatewayClient.logsTail({ limit });
      const raw = res as { lines?: string[] } | string | unknown[];
      const text = typeof raw === "string"
        ? raw
        : Array.isArray(raw)
          ? raw.join("\n")
          : Array.isArray((raw as { lines?: string[] })?.lines)
            ? (raw as { lines: string[] }).lines.join("\n")
            : JSON.stringify(res, null, 2);
      setLogs(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setLogs("");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="logs-panel">
      <div className="panel-toolbar">
        <h2>Logs</h2>
        <div className="panel-actions">
          <label className="logs-limit">
            Lines:{" "}
            <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={500}>500</option>
            </select>
          </label>
          <button type="button" className="btn btn-secondary" onClick={load} disabled={loading}>
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </div>
      {error && <div className="panel-error-inline">{error}</div>}
      <pre className="logs-content">{logs || (loading ? "Loading…" : "No logs.")}</pre>
    </div>
  );
}
