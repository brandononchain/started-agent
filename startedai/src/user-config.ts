/**
 * StartedAI — User config (gateway/agent JSON) load and save to file.
 */

import { readFile, writeFile, mkdir } from "fs/promises";
import { dirname } from "path";

let configPath: string | null = null;
let userConfig: Record<string, unknown> = {};

export function setConfigPath(path: string): void {
  configPath = path;
}

export function getUserConfig(): Record<string, unknown> {
  return { ...userConfig };
}

export function setUserConfig(config: Record<string, unknown>): void {
  userConfig = { ...config };
}

export async function loadUserConfigFromFile(): Promise<Record<string, unknown>> {
  if (!configPath) return {};
  try {
    const raw = await readFile(configPath, "utf-8");
    const data = JSON.parse(raw) as Record<string, unknown>;
    userConfig = data;
    return getUserConfig();
  } catch {
    return {};
  }
}

export async function saveUserConfigToFile(config: Record<string, unknown>): Promise<void> {
  if (!configPath) return;
  await mkdir(dirname(configPath), { recursive: true });
  await writeFile(configPath, JSON.stringify(config, null, 2), "utf-8");
  userConfig = { ...config };
}
