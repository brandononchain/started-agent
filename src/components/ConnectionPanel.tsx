import { useState, useCallback } from "react";
import { gatewayClient } from "../gateway/client";
import "./ConnectionPanel.css";

const STORAGE_URL = "started-agent-gateway-url";
const STORAGE_TOKEN = "started-agent-token";

export function ConnectionPanel() {
  const [url, setUrl] = useState(() => localStorage.getItem(STORAGE_URL) || "ws://127.0.0.1:18789");
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_TOKEN) || "");
  const [showToken, setShowToken] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const connect = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_URL, url);
      if (token) localStorage.setItem(STORAGE_TOKEN, token);
      gatewayClient.connect(url, { token: token || undefined });
    } catch (e) {
      console.error(e);
    }
  }, [url, token]);

  const disconnect = useCallback(() => {
    gatewayClient.disconnect();
  }, []);

  const isConnected = gatewayClient.state === "connected";

  return (
    <div className="connection-panel">
      <div className="connection-row">
        <input
          type="text"
          className="connection-url"
          placeholder="StartedAI URL (e.g. ws://127.0.0.1:18789)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && connect()}
        />
        <input
          type={showToken ? "text" : "password"}
          className="connection-token"
          placeholder="Token (optional)"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && connect()}
          title="StartedAI auth token"
        />
        <button
          type="button"
          className="connection-toggle-token"
          onClick={() => setShowToken((s) => !s)}
          title={showToken ? "Hide token" : "Show token"}
        >
          {showToken ? "🙈" : "👁"}
        </button>
        {isConnected ? (
          <button type="button" className="btn btn-secondary" onClick={disconnect}>
            Disconnect
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={connect}>
            Connect
          </button>
        )}
        <button
          type="button"
          className="connection-expand"
          onClick={() => setExpanded((e) => !e)}
          title="Settings"
        >
          ⚙
        </button>
      </div>
      {expanded && (
        <div className="connection-expanded">
          <p className="connection-hint">
            Store StartedAI URL and token in this browser. For remote StartedAI use{" "}
            <code>wss://</code> and add this origin to StartedAI’s allowed origins.
            By <a href="https://started.dev" target="_blank" rel="noopener noreferrer">started.dev</a>.
          </p>
        </div>
      )}
    </div>
  );
}
