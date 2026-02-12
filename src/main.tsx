import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Optional: apply gatewayUrl + token from URL (then remove from URL for security)
const params = new URLSearchParams(window.location.search);
const gatewayUrl = params.get("gatewayUrl");
const token = params.get("token");
if (gatewayUrl) {
  try {
    localStorage.setItem("started-agent-gateway-url", gatewayUrl);
    if (token) localStorage.setItem("started-agent-token", token);
    const url = new URL(window.location.href);
    url.searchParams.delete("gatewayUrl");
    url.searchParams.delete("token");
    window.history.replaceState({}, "", url.pathname + url.search || "/");
  } catch (_) {
    // ignore
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
