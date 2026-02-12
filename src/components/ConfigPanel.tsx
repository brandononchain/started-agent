import { useState, useEffect, useCallback } from "react";
import { gatewayClient } from "../gateway/client";
import "./Panels.css";
import "./ConfigPanel.css";

export function ConfigPanel() {
  const [config, setConfig] = useState<string>("");
  const [schema, setSchema] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cfg, sch] = await Promise.all([
        gatewayClient.configGet(),
        gatewayClient.configSchema().catch(() => null),
      ]);
      setConfig(JSON.stringify(cfg, null, 2));
      setSchema(sch ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      let parsed: unknown;
      try {
        parsed = JSON.parse(config);
      } catch {
        setError("Invalid JSON");
        setSaving(false);
        return;
      }
      await gatewayClient.configSet({ config: parsed });
      setMessage("Config saved. Apply to restart StartedAI with new config.");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const handleApply = async () => {
    setApplyLoading(true);
    setError(null);
    setMessage(null);
    try {
      await gatewayClient.configApply();
      setMessage("Config applied; StartedAI may restart.");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="panel-loading">
        <p>Loading config…</p>
      </div>
    );
  }

  return (
    <div className="config-panel">
      <div className="panel-toolbar">
        <h2>Config</h2>
        <div className="panel-actions">
          <button type="button" className="btn btn-secondary" onClick={load} disabled={loading}>
            Refresh
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
          <button type="button" className="btn btn-primary" onClick={handleApply} disabled={applyLoading}>
            {applyLoading ? "Applying…" : "Apply & restart"}
          </button>
        </div>
      </div>
      {error && <div className="panel-error-inline">{error}</div>}
      {message && <div className="panel-message">{message}</div>}
      {schema != null && (
        <p className="panel-hint">Schema available; editing raw JSON. Config file path is set by StartedAI.</p>
      )}
      <textarea
        className="config-editor"
        value={config}
        onChange={(e) => setConfig(e.target.value)}
        spellCheck={false}
      />
    </div>
  );
}
