import { useState, useEffect, useCallback } from "react";
import { gatewayClient } from "../gateway/client";
import "./Panels.css";
import "./DebugPanel.css";

export function DebugPanel() {
  const [status, setStatus] = useState<unknown>(null);
  const [health, setHealth] = useState<unknown>(null);
  const [models, setModels] = useState<unknown[]>([]);
  const [presence, setPresence] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [st, he, modRes, presRes] = await Promise.all([
        gatewayClient.status().catch(() => null),
        gatewayClient.health().catch(() => null),
        gatewayClient.modelsList().catch(() => ({ models: [] })),
        gatewayClient.systemPresence().catch(() => null),
      ]);
      setStatus(st);
      setHealth(he);
      setModels(Array.isArray((modRes as { models?: unknown[] })?.models) ? (modRes as { models: unknown[] }).models : []);
      setPresence(presRes);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="panel-loading">
        <p>Loading debug info…</p>
      </div>
    );
  }

  return (
    <div className="debug-panel">
      <div className="panel-toolbar">
        <h2>Debug</h2>
        <button type="button" className="btn btn-secondary" onClick={load}>
          Refresh
        </button>
      </div>
      {error && <div className="panel-error-inline">{error}</div>}

      <section className="debug-section">
        <h3>Status</h3>
        <pre className="debug-pre">{JSON.stringify(status, null, 2) || "—"}</pre>
      </section>

      <section className="debug-section">
        <h3>Health</h3>
        <pre className="debug-pre">{JSON.stringify(health, null, 2) || "—"}</pre>
      </section>

      <section className="debug-section">
        <h3>Models</h3>
        {models.length === 0 ? (
          <p className="panel-empty">No models listed.</p>
        ) : (
          <ul className="debug-list">
            {models.map((m, i) => (
              <li key={i}>{typeof m === "object" && m && "id" in m ? String((m as { id: string }).id) : JSON.stringify(m)}</li>
            ))}
          </ul>
        )}
      </section>

      {presence != null && (
        <section className="debug-section">
          <h3>Presence</h3>
          <pre className="debug-pre">{JSON.stringify(presence, null, 2)}</pre>
        </section>
      )}
    </div>
  );
}
