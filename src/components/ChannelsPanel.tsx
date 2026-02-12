import { useState, useEffect, useCallback } from "react";
import { gatewayClient } from "../gateway/client";
import type { ChannelsStatusPayload } from "../gateway/types";
import "./Panels.css";

export function ChannelsPanel() {
  const [channels, setChannels] = useState<ChannelsStatusPayload["channels"]>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await gatewayClient.channelsStatus();
      setChannels(res.channels ?? {});
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setChannels({});
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
        <p>Loading channels…</p>
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

  const entries = Object.entries(channels ?? {});

  return (
    <div className="channels-panel">
      <div className="panel-toolbar">
        <h2>Channels</h2>
        <button type="button" className="btn btn-secondary" onClick={load}>
          Refresh
        </button>
      </div>
      {entries.length === 0 ? (
        <p className="panel-empty">No channel status.</p>
      ) : (
        <ul className="channels-list">
          {entries.map(([name, ch]) => (
            <li key={name} className="channel-item">
              <span className="channel-name">{name}</span>
              <span className={`channel-status channel-status--${ch?.connected ? "connected" : "disconnected"}`}>
                {ch?.connected ? "Connected" : ch?.status ?? "—"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
