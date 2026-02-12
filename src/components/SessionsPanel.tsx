import { useState, useEffect, useCallback } from "react";
import { gatewayClient } from "../gateway/client";
import type { SessionEntry } from "../gateway/types";
import "./Panels.css";

export function SessionsPanel() {
  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await gatewayClient.sessionsList();
      setSessions(res.sessions ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setSessions([]);
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
        <p>Loading sessions…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel-error">
        <p>{error}</p>
        <button type="button" className="btn btn-secondary" onClick={load}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="sessions-panel">
      <div className="panel-toolbar">
        <h2>Sessions</h2>
        <button type="button" className="btn btn-secondary" onClick={load}>
          Refresh
        </button>
      </div>
      {sessions.length === 0 ? (
        <p className="panel-empty">No sessions.</p>
      ) : (
        <ul className="sessions-list">
          {sessions.map((s) => (
            <li key={s.key} className="session-item">
              <div className="session-key">{s.key}</div>
              <div className="session-meta">
                {s.model && <span>model: {s.model}</span>}
                {s.thinkingLevel != null && <span>thinking: {String(s.thinkingLevel)}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
