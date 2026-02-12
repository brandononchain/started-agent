/**
 * StartedAI — Protocol method handlers.
 */

import { PROTOCOL_VERSION } from "./protocol/types.js";
import type { ConnectParams, HelloOkPayload } from "./protocol/types.js";
import { getConfig } from "./config-store.js";
import {
  getUserConfig,
  setUserConfig,
  loadUserConfigFromFile,
  saveUserConfigToFile,
  setConfigPath,
} from "./user-config.js";

type Ctx = { clientId: string };

export async function handleConnect(
  params: Record<string, unknown> | undefined,
  _ctx: Ctx
): Promise<{ ok: true; payload: HelloOkPayload } | { ok: false; error: string }> {
  const connectParams = (params ?? {}) as unknown as ConnectParams;
  const token = getConfig().token;

  if (token && token.length > 0) {
    const provided = connectParams.auth?.token ?? connectParams.auth?.password;
    if (provided !== token) {
      return { ok: false, error: "Invalid token" };
    }
  }

  const payload: HelloOkPayload = {
    type: "hello-ok",
    protocol: Math.min(PROTOCOL_VERSION, connectParams.maxProtocol ?? PROTOCOL_VERSION),
    policy: { tickIntervalMs: 5000 },
    auth: { role: "operator", scopes: ["operator.read", "operator.write", "operator.admin", "operator.approvals"] },
  };
  return { ok: true, payload };
}

export async function handleHealth(
  _params: Record<string, unknown> | undefined,
  _ctx: Ctx
): Promise<{ ok: true; payload: unknown }> {
  return { ok: true, payload: { ok: true, ts: Date.now() } };
}

export async function handleStatus(
  _params: Record<string, unknown> | undefined,
  _ctx: Ctx
): Promise<{ ok: true; payload: unknown }> {
  return { ok: true, payload: { version: "0.1.0", name: "StartedAI" } };
}

export async function handleConfigGet(
  _params: Record<string, unknown> | undefined,
  _ctx: Ctx
): Promise<{ ok: true; payload: unknown }> {
  return { ok: true, payload: getUserConfig() };
}

export async function handleConfigSchema(
  _params: Record<string, unknown> | undefined,
  _ctx: Ctx
): Promise<{ ok: true; payload: unknown }> {
  return { ok: true, payload: null };
}

export async function handleConfigSet(
  params: Record<string, unknown> | undefined,
  _ctx: Ctx
): Promise<{ ok: true; payload?: unknown } | { ok: false; error: string }> {
  const config = params?.config;
  if (config === undefined || config === null) {
    return { ok: false, error: "Missing config" };
  }
  if (typeof config !== "object" || Array.isArray(config)) {
    return { ok: false, error: "Config must be an object" };
  }
  try {
    await saveUserConfigToFile(config as Record<string, unknown>);
    return { ok: true, payload: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function handleConfigApply(
  _params: Record<string, unknown> | undefined,
  _ctx: Ctx
): Promise<{ ok: true; payload?: unknown } | { ok: false; error: string }> {
  try {
    await loadUserConfigFromFile();
    return { ok: true, payload: undefined };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export function initUserConfig(configFilePath: string): void {
  setConfigPath(configFilePath);
}

/** Stub handler that returns ok with a fixed payload (for methods not yet implemented). */
export function handleStub(payload: unknown) {
  return async (): Promise<{ ok: true; payload?: unknown }> => ({ ok: true, payload });
}
