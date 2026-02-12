import type { GatewayConnectionState } from "../gateway/client";
import "./StatusBar.css";

type Props = { state: GatewayConnectionState; error?: string };

export function StatusBar({ state, error }: Props) {
  const label =
    state === "connected"
      ? "Connected"
      : state === "connecting" || state === "challenge"
        ? "Connecting…"
        : state === "error"
          ? `Error${error ? `: ${error}` : ""}`
          : "Disconnected";

  return (
    <footer className="status-bar">
      <span className={`status-dot status-dot--${state}`} />
      <span className="status-label">{label}</span>
      <span className="status-brand">
        <a href="https://started.dev" target="_blank" rel="noopener noreferrer">started.dev</a>
      </span>
    </footer>
  );
}
