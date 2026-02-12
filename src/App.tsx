import { useEffect, useState } from "react";
import { gatewayClient, type GatewayConnectionState } from "./gateway/client";
import { ConnectionPanel } from "./components/ConnectionPanel";
import { ChatPanel } from "./components/ChatPanel";
import { SessionsPanel } from "./components/SessionsPanel";
import { ChannelsPanel } from "./components/ChannelsPanel";
import { ConfigPanel } from "./components/ConfigPanel";
import { CronPanel } from "./components/CronPanel";
import { SkillsPanel } from "./components/SkillsPanel";
import { NodesPanel } from "./components/NodesPanel";
import { DebugPanel } from "./components/DebugPanel";
import { LogsPanel } from "./components/LogsPanel";
import { UpdatePanel } from "./components/UpdatePanel";
import { StatusBar } from "./components/StatusBar";
import "./App.css";

export type TabId =
  | "chat"
  | "sessions"
  | "channels"
  | "config"
  | "cron"
  | "skills"
  | "nodes"
  | "debug"
  | "logs"
  | "update";

const TABS: { id: TabId; label: string }[] = [
  { id: "chat", label: "Chat" },
  { id: "sessions", label: "Sessions" },
  { id: "channels", label: "Channels" },
  { id: "config", label: "Config" },
  { id: "cron", label: "Cron" },
  { id: "skills", label: "Skills" },
  { id: "nodes", label: "Nodes" },
  { id: "debug", label: "Debug" },
  { id: "logs", label: "Logs" },
  { id: "update", label: "Update" },
];

export default function App() {
  const [state, setState] = useState<GatewayConnectionState>(gatewayClient.state);
  const [error, setError] = useState<string | undefined>();
  const [tab, setTab] = useState<TabId>("chat");

  useEffect(() => {
    gatewayClient.setListener({
      onState: (s, e) => {
        setState(s);
        setError(e);
      },
    });
    setState(gatewayClient.state);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-brand">
          <a href="https://started.dev" target="_blank" rel="noopener noreferrer" className="app-logo">
            Started
          </a>
          <span className="app-tagline">Control UI</span>
        </div>
        <ConnectionPanel />
      </header>

      {state === "connected" ? (
        <div className="app-body">
          <nav className="app-tabs" role="tablist">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                className={tab === id ? "active" : ""}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </nav>
          <main className="app-main">
            {tab === "chat" && <ChatPanel />}
            {tab === "sessions" && <SessionsPanel />}
            {tab === "channels" && <ChannelsPanel />}
            {tab === "config" && <ConfigPanel />}
            {tab === "cron" && <CronPanel />}
            {tab === "skills" && <SkillsPanel />}
            {tab === "nodes" && <NodesPanel />}
            {tab === "debug" && <DebugPanel />}
            {tab === "logs" && <LogsPanel />}
            {tab === "update" && <UpdatePanel />}
          </main>
        </div>
      ) : (
        <div className="app-welcome">
          <div className="welcome-card">
            <h1>
              <a href="https://started.dev" target="_blank" rel="noopener noreferrer">Started</a>
            </h1>
            <p>
              Connect to your StartedAI gateway to chat, manage config, cron, skills, and more.
            </p>
            {state === "error" && error && (
              <>
                <p className="welcome-error">{error}</p>
                {gatewayClient.lastWsUrl && (
                  <p className="welcome-url">Tried: <code>{gatewayClient.lastWsUrl}</code></p>
                )}
                {gatewayClient.lastWsUrl?.includes(".ts.net") && (
                  <p className="welcome-hint welcome-troubleshoot">
                    Using Tailscale? Funnel often doesn’t support WebSockets. Use <strong>Tailscale Serve</strong> to expose StartedAI, or put a reverse proxy (e.g. Caddy) in front that supports WSS and point Funnel at it. If the StartedAI port is exposed, try <code>wss://your-machine.ts.net:18789</code>.
                  </p>
                )}
              </>
            )}
            {state === "connecting" && (
              <p className="welcome-connecting">Connecting…</p>
            )}
            <p className="welcome-hint">
              Set the StartedAI URL and token in the header, or use{" "}
              <code>?gatewayUrl=ws://host:18789&token=…</code> in the URL.
            </p>
            <p className="welcome-by">
              by <a href="https://started.dev" target="_blank" rel="noopener noreferrer">started.dev</a>
            </p>
          </div>
        </div>
      )}

      <StatusBar state={state} error={error} />
    </div>
  );
}
