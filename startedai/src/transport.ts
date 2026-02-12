/**
 * StartedAI — WebSocket transport.
 * Listens for connections, validates origin, parses JSON req/res and routes by method.
 */

import { WebSocketServer } from "ws";
import type { WebSocket } from "ws";
import type { IncomingMessage } from "http";
import type { StartedAIConfig } from "./config.js";
import { PROTOCOL_VERSION } from "./protocol/types.js";
import type { WsRequest, WsResponse } from "./protocol/types.js";
import {
  handleConnect,
  handleHealth,
  handleStatus,
  handleConfigGet,
  handleConfigSchema,
  handleConfigSet,
  handleConfigApply,
  handleStub,
} from "./handlers.js";

export type MethodHandler = (
  params: Record<string, unknown> | undefined,
  ctx: { clientId: string }
) => Promise<{ ok: true; payload?: unknown } | { ok: false; error: string }>;

const HANDLERS: Record<string, MethodHandler> = {
  connect: handleConnect,
  health: handleHealth,
  status: handleStatus,
  "config.get": handleConfigGet,
  "config.schema": handleConfigSchema,
  "config.set": handleConfigSet,
  "config.apply": handleConfigApply,
  "chat.history": handleStub({ messages: [] }),
  "chat.send": handleStub({ runId: "stub", status: "ok" }),
  "chat.abort": handleStub(undefined),
  "sessions.list": handleStub({ sessions: [] }),
  "channels.status": handleStub({ channels: {} }),
  "cron.list": handleStub({ jobs: [] }),
  "cron.add": handleStub(undefined),
  "cron.run": handleStub(undefined),
  "cron.patch": handleStub(undefined),
  "cron.delete": handleStub(undefined),
  "cron.history": handleStub(undefined),
  "skills.status": handleStub(undefined),
  "skills.list": handleStub({ skills: [] }),
  "skills.patch": handleStub(undefined),
  "skills.install": handleStub(undefined),
  "node.list": handleStub({ nodes: [] }),
  "system-presence": handleStub(undefined),
  "models.list": handleStub({ models: [] }),
  "logs.tail": handleStub({ lines: [] }),
  "update.run": handleStub(undefined),
  "exec.approval.resolve": handleStub(undefined),
};

export function createServer(config: StartedAIConfig) {
  const wss = new WebSocketServer({ host: config.bind, port: config.port });

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    const origin = req.headers.origin ?? "";
    if (!config.allowedOrigins.some((o) => origin === o || o === "*")) {
      ws.close(1008, "Origin not allowed");
      return;
    }

    const clientId = `client_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    ws.on("message", (data: Buffer) => {
      try {
        const msg = JSON.parse(data.toString()) as WsRequest;
        if (msg.type !== "req" || typeof msg.method !== "string") return;

        const handler = HANDLERS[msg.method];
        if (!handler) {
          send(ws, { type: "res", id: msg.id, ok: false, error: `Unknown method: ${msg.method}` });
          return;
        }

        handler(msg.params ?? {}, { clientId }).then((result) => {
          if (result.ok) {
            send(ws, { type: "res", id: msg.id, ok: true, payload: result.payload });
          } else {
            send(ws, { type: "res", id: msg.id, ok: false, error: result.error });
          }
        }).catch((err) => {
          send(ws, {
            type: "res",
            id: msg.id,
            ok: false,
            error: err instanceof Error ? err.message : String(err),
          });
        });
      } catch (_) {
        // ignore parse errors
      }
    });
  });

  return wss;
}

function send(ws: WebSocket, msg: WsResponse): void {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

export function getProtocolVersion(): number {
  return PROTOCOL_VERSION;
}
