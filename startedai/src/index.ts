#!/usr/bin/env node
/**
 * StartedAI — Gateway for Started Agent.
 * By started.dev
 *
 * Usage:
 *   node dist/index.js [--port 18789] [--token YOUR_TOKEN]
 *   PORT=18789 TOKEN=xxx node dist/index.js
 *
 * Environment:
 *   PORT          WebSocket port (default 18789)
 *   BIND          Bind address (default 0.0.0.0)
 *   TOKEN         Optional auth token for Control UI
 *   ALLOWED_ORIGINS  Comma-separated origins (default includes localhost and Vercel)
 */

import { loadConfig } from "./config.js";
import { setConfig } from "./config-store.js";
import { createServer } from "./transport.js";
import { initUserConfig } from "./handlers.js";
import { loadUserConfigFromFile } from "./user-config.js";

function parseArgs(): Partial<{ port: number; token: string }> {
  const args = process.argv.slice(2);
  const out: { port?: number; token?: string } = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--port" && args[i + 1]) {
      out.port = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === "--token" && args[i + 1]) {
      out.token = args[i + 1];
      i++;
    }
  }
  return out;
}

async function main() {
  const config = loadConfig(process.env);
  const cli = parseArgs();
  if (cli.port != null) config.port = cli.port;
  if (cli.token != null) config.token = cli.token;

  setConfig(config);
  initUserConfig(config.configFilePath);
  await loadUserConfigFromFile().catch(() => ({}));
  createServer(config);

  const host = config.bind === "0.0.0.0" ? "127.0.0.1" : config.bind;
  console.log(`StartedAI listening on ws://${host}:${config.port}`);
  console.log(`  Config file: ${config.configFilePath}`);
  console.log(`  Token: ${config.token ? "set" : "none"}`);
  console.log(`  Allowed origins: ${config.allowedOrigins.join(", ")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
