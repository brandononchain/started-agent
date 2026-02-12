# StartedAI — Gateway for Started Agent

**StartedAI** is the gateway that the **Started Agent** Control UI connects to. By **[started.dev](https://started.dev)**.

It speaks the WebSocket protocol (v3) and implements connect, health, status, config (get/set/schema/apply), and stubs for chat, sessions, channels, cron, skills, nodes, logs, and update. Use the Control UI to connect and manage config; extend StartedAI with real agent, channels, and skills as needed.

## Requirements

- **Node.js 22+**

## Quick start

```bash
cd startedai
npm install
npm run build
npm start
```

Then open the [Started Agent](https://github.com/brandononchain/started-agent) UI (e.g. `npm run dev` in the parent repo), set **StartedAI URL** to `ws://127.0.0.1:18789`, and click **Connect**.

## Configuration

| Env / CLI | Description |
|-----------|-------------|
| `PORT` / `--port` | WebSocket port (default `18789`) |
| `BIND` | Bind address (default `0.0.0.0`) |
| `TOKEN` / `--token` | Optional auth token for the Control UI |
| `ALLOWED_ORIGINS` | Comma-separated allowed origins (default includes localhost and Vercel) |
| `CONFIG_PATH` | Path to gateway config JSON file (default `.startedai/config.json`) |

Example with token:

```bash
TOKEN=your-secret-token npm start
# or
npm start -- --port 18789 --token your-secret-token
```

## Config file

The Control UI **Config** panel reads and writes the gateway config. It is stored at `CONFIG_PATH` (default: `.startedai/config.json`). **Save** writes the JSON to disk; **Apply** reloads it into memory.

## Protocol

StartedAI implements the same WebSocket protocol as the Control UI expects (see `started-agent/src/gateway/types.ts` and `client.ts`). Methods implemented fully: `connect`, `health`, `status`, `config.get`, `config.schema`, `config.set`, `config.apply`. Other methods return stub responses so all UI panels load.

## License

MIT · [started.dev](https://started.dev)
