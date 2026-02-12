# Started Agent — Control UI

**Started Agent** is a full **Control UI** for your gateway. By **[started.dev](https://started.dev)**.

Connect to your gateway over WebSocket to manage chat, config, cron, skills, nodes, logs, and more. Deploy on **Vercel** and point it at your self-hosted gateway.

**→ [How to use Started Agent](GETTING-STARTED.md)** — connection, panels, and workflows.  
**→ [Deploy a 24/7 gateway](DEPLOY-GATEWAY.md)** — run the gateway on a VPS, Fly.io, or at home.

## Features

| Panel | Description |
|-------|-------------|
| **Chat** | Send messages, stream replies, view history, abort runs |
| **Sessions** | List sessions and metadata |
| **Channels** | View channel status (WhatsApp, Telegram, Discord, etc.) |
| **Config** | View and edit gateway config JSON, save, apply & restart |
| **Cron** | List jobs, run now, enable/disable |
| **Skills** | List skills, enable/disable |
| **Nodes** | List connected nodes (iOS/Android/macOS) and caps |
| **Debug** | Status, health, models list, presence |
| **Logs** | Live tail of gateway logs with line limit |
| **Update** | Run package/git update and restart gateway |

- **Connection**: Gateway URL + token (stored in browser). Optional `?gatewayUrl=ws://host:18789&token=…` for one-time connect.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Connect to `ws://127.0.0.1:18789` (or your gateway). Use a token if your gateway requires one.

## Deploy on Vercel

1. Import this repo in [Vercel](https://vercel.com). Build: `npm run build`, Output: `dist`.
2. For a **remote** gateway, allow this app’s origin in your gateway’s config (e.g. allowed origins / CORS for the Control UI).

## Tech stack

- **Vite** + **React** + **TypeScript**
- **Gateway WebSocket protocol** (v3), with scopes: `operator.read`, `operator.write`, `operator.admin`, `operator.approvals`.

## License

MIT · [started.dev](https://started.dev)
