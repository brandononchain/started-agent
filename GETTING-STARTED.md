# How to Use Started Agent

This guide explains how to run and use **Started Agent** (the Control UI) to work with your gateway.

---

## What You Need

1. **A gateway** running somewhere (your computer or a server) that speaks the same WebSocket protocol. The gateway is what actually runs the agent, connects to channels (WhatsApp, Telegram, etc.), and executes tools.  
   **→ Need to run a gateway 24/7?** See [Deploy a 24/7 gateway](DEPLOY-GATEWAY.md).
2. **Started Agent** (this UI) — either run it locally or use a deployed version (e.g. on Vercel).

The UI only talks to the gateway over WebSocket. It does not run the agent itself.

---

## Running the UI

### Option A: Local (development or personal use)

```bash
npm install
npm run dev
```

- Open **http://localhost:5173** in your browser.
- In the header, enter your **Gateway URL** (e.g. `ws://127.0.0.1:18789` or `ws://localhost:18789`).
- If your gateway requires auth, enter the **token** in the field next to it.
- Click **Connect**.

### Option B: Deployed (e.g. Vercel)

1. Deploy this repo to Vercel (or any static host). Build command: `npm run build`, output: `dist`.
2. Open your deployed URL.
3. Enter the **Gateway URL** (use `wss://` for a remote gateway over HTTPS) and **token** if needed, then click **Connect**.

For a **remote** gateway, the gateway must allow your UI’s origin (e.g. `https://your-app.vercel.app`) in its config so the browser can open the WebSocket.

---

## One-Time Connect via URL

You can pass the gateway URL and token in the address bar once. They are saved in the browser and removed from the URL for security.

Example:

```
https://your-app.vercel.app/?gatewayUrl=wss://your-gateway.example.com&token=YOUR_TOKEN
```

After the page loads, the UI stores these values and strips them from the URL.

---

## Connection Status

- **Disconnected** — Not connected. Enter URL (and token) and click Connect.
- **Connecting…** — WebSocket is opening and handshake is in progress.
- **Connected** — You’re in. All tabs are available.
- **Error** — Connection failed. Check URL, token, network, and that the gateway allows this origin.

If you see something like “Pairing required,” the gateway may require you to approve this device (e.g. via a CLI command on the gateway host).

---

## Panels (Tabs)

### Chat

- **View history** — Messages for the default session load when you open the tab.
- **Send a message** — Type in the box and press Enter or click **Send**.
- **Stop** — Click **Stop** to abort the current agent run.
- Replies stream in as the agent responds.

### Sessions

- Lists active sessions (e.g. by channel or user).
- Shows session keys and metadata (model, settings). Use this to see who/what is connected.

### Channels

- Shows status of each channel (WhatsApp, Telegram, Discord, etc.) — e.g. connected or not.
- Use this to confirm that the gateway is linked to the right apps.

### Config

- **View** — Shows the current gateway config (JSON).
- **Edit** — Change the JSON in the text area. Ensure it stays valid JSON.
- **Save** — Sends the edited config to the gateway (writes to its config file). Does not restart.
- **Apply & restart** — Applies the config and restarts the gateway so changes take effect.

Be careful with config: invalid JSON or wrong values can break the gateway. Prefer small, tested edits.

### Cron

- **List** — Shows scheduled cron jobs (e.g. daily summaries, reminders).
- **Run now** — Runs a job once on demand.
- **Enable / Disable** — Toggle a job on or off without deleting it.

### Skills

- **List** — Shows installed skills (plugins/capabilities).
- **Enable / Disable** — Turn a skill on or off. Disabled skills are not used by the agent.

### Nodes

- **List** — Shows connected nodes (e.g. iOS/Android/macOS devices) that provide camera, screen, canvas, etc.
- Use this to see which devices are paired and their capabilities.

### Debug

- **Status** — Gateway status payload (version, etc.).
- **Health** — Health check result.
- **Models** — List of models the gateway can use.
- **Presence** — Connected clients/devices.

Use this to confirm the gateway is healthy and to see which models are available.

### Logs

- **Tail** — Fetches recent gateway log lines.
- **Lines** — Choose how many lines (50–500).
- **Refresh** — Reload the log tail.

Use this to troubleshoot errors or inspect what the gateway is doing.

### Update

- **Run update** — Tells the gateway to run its update process (e.g. pull latest release and restart).
- Use this when you want to upgrade the gateway to a newer version.

---

## Typical Workflows

1. **Daily chat**  
   Connect → open **Chat** → send messages and read replies.

2. **Change gateway settings**  
   Connect → **Config** → edit JSON → **Save** → **Apply & restart** if the change requires a restart.

3. **Add or run a scheduled job**  
   Connect → **Cron** → use the list and “Run now” or add jobs if your gateway supports adding from the UI (otherwise use the gateway CLI).

4. **Check why something failed**  
   Connect → **Logs** (increase lines if needed) and **Debug** (status/health) to see errors and state.

5. **Allow the UI from another device**  
   Deploy the UI (e.g. Vercel), then in the gateway config add your deployed origin to allowed origins so the browser can connect from anywhere.

---

## Troubleshooting

| Problem | What to try |
|--------|--------------|
| **Can’t connect** | Check Gateway URL (e.g. `ws://` for local, `wss://` for remote). Ensure the gateway is running and reachable. If using a token, paste it again. |
| **“Pairing required”** | Approve this device from the gateway (e.g. via CLI on the gateway host). |
| **Connected but panels fail** | Some actions need admin/approval scopes. Ensure the token has the right permissions. Check **Debug** and **Logs** for errors. |
| **Remote UI can’t connect** | The gateway must allow your UI’s origin (e.g. `https://your-app.vercel.app`) in its Control UI / allowed-origins config. |
| **Config save/apply fails** | Ensure the JSON is valid. Check **Logs** for the exact error. |

---

## Summary

1. Run or open Started Agent (local or deployed).
2. Enter **Gateway URL** and **token** (if required), then **Connect**.
3. Use the tabs to **chat**, manage **config**, **cron**, **skills**, **nodes**, and to inspect **debug** info and **logs**.
4. Use **Update** when you want to upgrade the gateway.

For more on the project and deployment, see [README.md](README.md).
