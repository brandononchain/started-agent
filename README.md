# Started Agent — Control UI

**Started Agent** is a full **Control UI** for your **StartedAI** gateway. By **[started.dev](https://started.dev)**.

Connect to StartedAI over WebSocket to manage chat, config, cron, skills, nodes, logs, and more. Deploy on **Vercel** and point it at your self-hosted StartedAI.

**→ [How to use Started Agent](GETTING-STARTED.md)** — connection, panels, and workflows.  
**→ [Deploy StartedAI 24/7](DEPLOY-GATEWAY.md)** — run StartedAI on a VPS, Fly.io, or at home.

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

- **Connection**: StartedAI URL + token (stored in browser). Optional `?gatewayUrl=ws://host:18789&token=…` for one-time connect.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Connect to your StartedAI (e.g. `ws://127.0.0.1:18789`). Use a token if StartedAI requires one.

## Deploy on Vercel

1. Import this repo in [Vercel](https://vercel.com). Build: `npm run build`, Output: `dist`.
2. For a **remote** StartedAI, allow this app’s origin in StartedAI’s config (e.g. allowed origins / CORS for the Control UI).

## Tech stack

- **Vite** + **React** + **TypeScript**
- **Gateway WebSocket protocol** (v3), with scopes: `operator.read`, `operator.write`, `operator.admin`, `operator.approvals`.

## License

MIT · [started.dev](https://started.dev)
