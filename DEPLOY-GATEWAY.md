# Deploying StartedAI 24/7

This guide explains how to run **StartedAI** (the gateway) 24/7 so that **Started Agent** (the Control UI) can connect to it from anywhere. StartedAI is the server that runs the agent, connects to channels (WhatsApp, Telegram, etc.), and speaks the WebSocket protocol the UI uses.

---

## What You Need

- **Node.js 22+** on the machine where StartedAI will run
- **API keys** for the models the agent uses (e.g. Anthropic, OpenAI)
- **StartedAI** (or gateway software that implements the same WebSocket protocol — install via npm or from source per the project’s docs)
- A **host** that can run 24/7: VPS, cloud VM, or home server

---

## Where to Run It 24/7

| Option | Pros | Cons |
|--------|------|------|
| **VPS** (DigitalOcean, Linode, Hetzner, Vultr, etc.) | Full control, predictable cost, any region | You manage OS and updates |
| **Fly.io / Railway / Render** | Easy deploy, auto-restart, often free tier | Less control, cold starts on some tiers |
| **Home server / Raspberry Pi** | No cloud cost, data stays local | You handle power, network, and port forwarding or Tailscale |
| **Existing server** | Reuse what you have | Must meet Node version and stay on |

Pick one and ensure Node 22+ is installed. Below we use a **Linux VPS** as the main example; the same ideas apply to other hosts.

---

## DigitalOcean: Product and Plan

If you use **DigitalOcean**, use a **Droplet** (VPS), not App Platform. StartedAI needs a long‑running process, persistent config/credentials on disk, and full control over Node and the process — a Droplet is the right fit.

| What | Choice |
|------|--------|
| **Product** | [Droplets](https://www.digitalocean.com/products/droplets) (Virtual Private Server) |
| **Plan** | **Basic** → **Regular** (shared CPU). |
| **Size** | **2 GB RAM / 1 vCPU** — **$12/mo** (recommended). Enough for StartedAI, the agent, and channels. |
| **Minimum** | 1 GB RAM / 1 vCPU — **$6/mo** if you want the cheapest option; may be tight under load. |
| **OS** | **Ubuntu 24.04 LTS**. |
| **Region** | Pick the closest to you (e.g. NYC, SFO, Amsterdam). |
| **Storage** | Default 50 GB SSD (included) is more than enough for config and logs. |

**Why not App Platform?** App Platform is better for stateless web apps. StartedAI expects a stable filesystem for config and credentials and is a single long‑running process; a Droplet gives you that and full control.

**Steps:**

1. In [DigitalOcean](https://cloud.digitalocean.com/droplets/new): create a **Droplet** → **Basic** → **Regular** → choose **2 GB / 1 CPU** ($12/mo) or 1 GB ($6/mo) → **Ubuntu 24.04 LTS** → pick a region → add your SSH key → create.
2. SSH in: `ssh root@<droplet-ip>` (or the user you set).
3. Follow the rest of this guide from **§ 1. Prepare the Server** below (install Node, StartedAI, systemd, then expose with Tailscale or a reverse proxy).

---

## 1. Prepare the Server (Linux VPS Example)

SSH into the machine and install Node 22+ if needed:

```bash
# Ubuntu/Debian: use NodeSource or nvm
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v   # should be v22.x
```

Create a dedicated user (optional but recommended):

```bash
sudo useradd -m -s /bin/bash gateway
sudo su - gateway
```

---

## 2. Install and Configure StartedAI

Install StartedAI (or the gateway that speaks the Started Agent protocol). For example, if it’s published on npm:

```bash
npm install -g startedai@latest
```

Or clone and build from source if that’s how the project is distributed. Follow that project’s install and onboarding steps.

Configure it once (API keys, optional channels, token for the Control UI):

- Set environment variables or edit the config file StartedAI uses (often under `~/.config/...` or a project-specific path).
- **Generate a token** for Started Agent: e.g. `openssl rand -hex 32`. Put it in the StartedAI config as the Control UI token so only clients with this token can connect.
- If you use channels (WhatsApp, Telegram, etc.), complete their login/linking steps as described in the StartedAI docs.

---

## 3. Run StartedAI as a Service (Always On)

So it keeps running and restarts after reboots.

### systemd (Linux)

Create a unit file, e.g. `/etc/systemd/system/startedai.service`:

```ini
[Unit]
Description=StartedAI Gateway
After=network.target

[Service]
Type=simple
User=gateway
WorkingDirectory=/home/gateway
Environment=NODE_ENV=production
ExecStart=/usr/bin/node /path/to/startedai/start.js --port 18789 --token YOUR_TOKEN
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Replace:

- `User` with the user that runs StartedAI
- `ExecStart` with the actual command that starts StartedAI (e.g. `startedai --port 18789` or `node dist/index.js`)
- `YOUR_TOKEN` with the token you generated

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable startedai
sudo systemctl start startedai
sudo systemctl status startedai
```

Logs: `journalctl -u startedai -f`

### Using StartedAI’s own “install daemon” option

If StartedAI offers something like:

```bash
startedai onboard --install-daemon
```

that can create the systemd (or launchd) service for you. Use that if available, then adjust the unit file only if you need a custom port or token.

---

## 4. Expose StartedAI Securely

The Started Agent UI connects over WebSocket. You must expose StartedAI in a safe way.

### Option A: Tailscale (recommended for personal use)

- Install [Tailscale](https://tailscale.com) on the server and on your devices.
- Bind StartedAI to **loopback only** (e.g. `--bind 127.0.0.1` or `127.0.0.1:18789`). Do not bind to `0.0.0.0` unless you put a proxy in front.
- Use **Tailscale Serve** or **Funnel** so StartedAI is reachable at `https://your-machine.tailnet-name.ts.net` (or similar). The StartedAI docs usually describe Tailscale integration.
- In Started Agent, set StartedAI URL to `wss://your-machine.tailnet-name.ts.net` (or the path StartedAI uses) and use your token. No open ports on the internet.

### Option B: Reverse proxy (nginx/Caddy) with HTTPS

- Bind StartedAI to `127.0.0.1:18789`.
- Install nginx or Caddy and add a vhost that:
  - Listens on 443 (HTTPS).
  - Proxies WebSocket requests to `127.0.0.1:18789`.
- Use a DNS name and a certificate (e.g. Let’s Encrypt). Example Caddy snippet:

```text
your-startedai.example.com {
  reverse_proxy 127.0.0.1:18789
}
```

- In StartedAI’s config, allow your Started Agent origin (e.g. `https://your-ui.vercel.app`) in allowed origins.
- In Started Agent, set StartedAI URL to `wss://your-startedai.example.com` and the token.

### Option C: Same machine only

- Run StartedAI on `127.0.0.1:18789`.
- Run Started Agent locally (`npm run dev`) and connect to `ws://127.0.0.1:18789`. Good for testing; not 24/7 from other devices unless you also expose the UI.

---

## 5. Firewall (If Exposing Beyond Tailscale)

If StartedAI or the proxy is reachable from the internet:

```bash
# Allow SSH, HTTP, HTTPS; block direct access to 18789 if you use a proxy
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

Keep StartedAI bound to loopback and only expose it via the reverse proxy or Tailscale.

---

## 6. Connect Started Agent to Your 24/7 StartedAI

1. **Local UI**  
   Run Started Agent (`npm run dev`), set StartedAI URL to `ws://127.0.0.1:18789` (if StartedAI is on the same machine) or `wss://your-startedai.example.com` (if remote), enter the token, then Connect.

2. **Deployed UI (e.g. Vercel)**  
   Open your deployed Started Agent URL, set StartedAI URL to `wss://your-startedai.example.com` (or your Tailscale URL), enter the token, then Connect.

3. **One-time URL**  
   You can use:  
   `https://your-ui.vercel.app/?gatewayUrl=wss://your-startedai.example.com&token=YOUR_TOKEN`  
   so the UI saves the StartedAI URL and token and connects.

---

## Summary Checklist

- [ ] Server or host with Node 22+ and 24/7 uptime
- [ ] StartedAI installed and configured (API keys, token, optional channels)
- [ ] StartedAI running as a service (systemd or equivalent) so it restarts on failure and on reboot
- [ ] StartedAI bound to loopback; exposed only via Tailscale or a reverse proxy with HTTPS
- [ ] Token set in StartedAI config and used in Started Agent
- [ ] Started Agent origin allowed in StartedAI config if you use a deployed UI
- [ ] Connect from Started Agent with `wss://...` and token

For using the UI once connected, see [GETTING-STARTED.md](GETTING-STARTED.md).
