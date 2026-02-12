import { useState, useEffect, useCallback } from "react";
import { gatewayClient } from "../gateway/client";
import "./Panels.css";
import "./NodesPanel.css";

type NodeEntry = { id?: string; deviceId?: string; caps?: string[]; commands?: string[]; [k: string]: unknown };

export function NodesPanel() {
  const [nodes, setNodes] = useState<NodeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await gatewayClient.nodeList();
      const list = res?.nodes;
      setNodes(Array.isArray(list) ? (list as NodeEntry[]) : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setNodes([]);
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
        <p>Loading nodes…</p>
      </div>
    );
  }

  return (
    <div className="nodes-panel">
      <div className="panel-toolbar">
        <h2>Nodes</h2>
        <button type="button" className="btn btn-secondary" onClick={load}>
          Refresh
        </button>
      </div>
      {error && <div className="panel-error-inline">{error}</div>}
      {nodes.length === 0 ? (
        <p className="panel-empty">No nodes connected. Pair iOS/Android/macOS nodes via the gateway.</p>
      ) : (
        <ul className="nodes-list">
          {nodes.map((node) => (
            <li key={node.id ?? node.deviceId ?? Math.random()} className="node-item">
              <div className="node-id">{node.deviceId ?? node.id ?? "—"}</div>
              {(node.caps?.length || node.commands?.length) ? (
                <div className="node-caps">
                  {node.caps?.length ? <span>Caps: {node.caps.join(", ")}</span> : null}
                  {node.commands?.length ? (
                    <span>Commands: {node.commands.slice(0, 5).join(", ")}{(node.commands?.length ?? 0) > 5 ? "…" : ""}</span>
                  ) : null}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
