/** StartedAI config: allowed origins, auth token, port, bind, config file path. */

import { join } from "path";

export type StartedAIConfig = {
  port: number;
  bind: string;
  token?: string;
  allowedOrigins: string[];
  configFilePath: string;
};

const DEFAULT_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://started-agent.vercel.app",
];

export function loadConfig(env: NodeJS.ProcessEnv = process.env): StartedAIConfig {
  const port = parseInt(env.PORT ?? "18789", 10);
  const bind = env.BIND ?? "0.0.0.0";
  const token = env.TOKEN ?? undefined;
  const originsRaw = env.ALLOWED_ORIGINS;
  const allowedOrigins = originsRaw
    ? originsRaw.split(",").map((o) => o.trim()).filter(Boolean)
    : DEFAULT_ORIGINS;
  const configFilePath =
    env.CONFIG_PATH ?? join(process.cwd(), ".startedai", "config.json");

  return { port, bind, token, allowedOrigins, configFilePath };
}
