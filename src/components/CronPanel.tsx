import { useState, useEffect, useCallback } from "react";
import { gatewayClient } from "../gateway/client";
import "./Panels.css";
import "./CronPanel.css";

type CronJob = { id?: string; schedule?: string; enabled?: boolean; delivery?: string; [k: string]: unknown };

export function CronPanel() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await gatewayClient.cronList();
      setJobs(Array.isArray(res.jobs) ? (res.jobs as CronJob[]) : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRun = async (id: string) => {
    setRunning(id);
    try {
      await gatewayClient.cronRun({ id });
      await load();
    } catch (_) {
      // ignore
    } finally {
      setRunning(null);
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await gatewayClient.cronEnable({ id, enabled });
      await load();
    } catch (_) {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="panel-loading">
        <p>Loading cron jobs…</p>
      </div>
    );
  }

  return (
    <div className="cron-panel">
      <div className="panel-toolbar">
        <h2>Cron jobs</h2>
        <button type="button" className="btn btn-secondary" onClick={load}>
          Refresh
        </button>
      </div>
      {error && <div className="panel-error-inline">{error}</div>}
      {jobs.length === 0 ? (
        <p className="panel-empty">No cron jobs.</p>
      ) : (
        <ul className="cron-list">
          {jobs.map((job) => (
            <li key={job.id ?? job.schedule ?? Math.random()} className="cron-item">
              <div className="cron-main">
                <span className="cron-schedule">{job.schedule ?? job.id ?? "—"}</span>
                {job.delivery != null && (
                  <span className="cron-delivery">delivery: {String(job.delivery)}</span>
                )}
              </div>
              <div className="cron-actions">
                <label className="cron-toggle">
                  <input
                    type="checkbox"
                    checked={job.enabled !== false}
                    onChange={(e) => handleToggle(String(job.id), e.target.checked)}
                  />
                  Enabled
                </label>
                {job.id && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleRun(job.id as string)}
                    disabled={running === job.id}
                  >
                    {running === job.id ? "Running…" : "Run now"}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
