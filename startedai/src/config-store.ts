/** In-memory config store (used by handlers). Set at startup from loadConfig(). */

import type { StartedAIConfig } from "./config.js";

let current: StartedAIConfig;

export function setConfig(config: StartedAIConfig): void {
  current = config;
}

export function getConfig(): StartedAIConfig {
  return current;
}
