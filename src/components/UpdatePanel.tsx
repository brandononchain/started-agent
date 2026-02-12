import { useState } from "react";
import { gatewayClient } from "../gateway/client";
import "./Panels.css";
import "./UpdatePanel.css";

export function UpdatePanel() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setRunning(true);
    setResult(null);
    setError(null);
    try {
      const res = await gatewayClient.updateRun();
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="update-panel">
      <div className="panel-toolbar">
        <h2>Update</h2>
      </div>
      <p className="update-desc">
        Run a package or git update and restart the gateway. Use when you want to pull the latest Started Agent release.
      </p>
      {error && <div className="panel-error-inline">{error}</div>}
      {result != null && (
        <div className="panel-message">
          <pre className="update-result">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
      <button
        type="button"
        className="btn btn-primary"
        onClick={handleRun}
        disabled={running}
      >
        {running ? "Running update…" : "Run update"}
      </button>
    </div>
  );
}
