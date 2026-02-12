/**
 * Started Agent — Gateway WebSocket client.
 * Speaks the gateway protocol (connect, chat.*, sessions.*, config, cron, skills, etc.).
 */

import {
  PROTOCOL_VERSION,
  type ConnectParams,
  type HelloOkPayload,
  type ChatSendParams,
  type ChatSendResult,
  type SessionsListPayload,
  type ChannelsStatusPayload,
  type StatusPayload,
  type WsEvent,
  type WsResponse,
} from "./types";

const CLIENT_ID = "started-control-ui";
const CLIENT_VERSION = "1.0.0";

function nextId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export type GatewayConnectionState =
  | "disconnected"
  | "connecting"
  | "challenge"
  | "connected"
  | "error";

export type GatewayListener = {
  onState?: (state: GatewayConnectionState, error?: string) => void;
  onEvent?: (event: string, payload: unknown) => void;
  onChat?: (payload: unknown) => void;
};

export class GatewayClient {
  private ws: WebSocket | null = null;
  private pending = new Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
  private listener: GatewayListener = {};
  private _state: GatewayConnectionState = "disconnected";
  private connectParams: { url: string; token?: string; password?: string } | null = null;

  get state(): GatewayConnectionState {
    return this._state;
  }

  setListener(l: GatewayListener): void {
    this.listener = l;
  }

  private setState(s: GatewayConnectionState, error?: string): void {
    this._state = s;
    this.listener.onState?.(s, error);
  }

  connect(url: string, options: { token?: string; password?: string } = {}): void {
    this.disconnect();
    this.connectParams = { url, token: options.token, password: options.password };
    const normalized = url.replace(/^https?:\/\//, "").replace(/\/+$/, "");
    const wsUrl = url.startsWith("wss")
      ? url
      : url.startsWith("ws://")
        ? url
        : url.startsWith("https://")
          ? `wss://${normalized}`
          : `ws://${normalized}`;
    this.setState("connecting");
    try {
      this.ws = new WebSocket(wsUrl);
    } catch (e) {
      this.setState("error", e instanceof Error ? e.message : String(e));
      return;
    }

    this.ws.onopen = () => {
      this.setState("connecting");
      this.startHandshake();
    };

    this.ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data as string) as WsEvent | WsResponse;
        if (msg.type === "event") {
          const e = msg as WsEvent;
          this.listener.onEvent?.(e.event, e.payload);
          if (e.event === "connect.challenge") {
            this.setState("challenge");
            this.sendConnect();
            return;
          }
          if (e.event.startsWith("chat.")) {
            this.listener.onChat?.(e.payload);
          }
          return;
        }
        if (msg.type === "res") {
          const res = msg as WsResponse;
          const p = this.pending.get(res.id);
          if (p) {
            this.pending.delete(res.id);
            if (res.ok) {
              p.resolve(res.payload);
            } else {
              p.reject(new Error(res.error ?? "Request failed"));
            }
          }
        }
      } catch (_) {
        // ignore parse errors
      }
    };

    this.ws.onerror = () => {
      this.setState("error", "WebSocket error");
    };

    this.ws.onclose = (ev) => {
      this.ws = null;
      this.pending.forEach((p) => p.reject(new Error("Connection closed")));
      this.pending.clear();
      if (this._state !== "error") {
        this.setState("disconnected", ev.code === 1008 ? "Pairing required" : undefined);
      }
    };
  }

  private sendConnect(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.connectParams) return;

    const params: ConnectParams = {
      minProtocol: PROTOCOL_VERSION,
      maxProtocol: PROTOCOL_VERSION,
      client: {
        id: CLIENT_ID,
        version: CLIENT_VERSION,
        platform: typeof navigator !== "undefined" ? "web" : "node",
        mode: "operator",
      },
      role: "operator",
      scopes: ["operator.read", "operator.write", "operator.admin", "operator.approvals"],
      locale: "en-US",
      userAgent: `${CLIENT_ID}/${CLIENT_VERSION}`,
      auth: {},
    };
    if (this.connectParams.token) {
      params.auth!.token = this.connectParams.token;
    }
    if (this.connectParams.password) {
      params.auth!.password = this.connectParams.password;
    }

    const id = nextId();
    this.ws.send(
      JSON.stringify({
        type: "req",
        id,
        method: "connect",
        params,
      })
    );

    const onRes = (ev: MessageEvent) => {
      try {
        const msg = JSON.parse(ev.data as string);
        if (msg.type === "res" && msg.id === id) {
          this.ws!.removeEventListener("message", onRes);
          if (msg.ok && msg.payload) {
            const hello = msg.payload as HelloOkPayload;
            if (hello.type === "hello-ok") {
              this.setState("connected");
            }
          } else {
            this.setState("error", msg.error ?? "Connect failed");
          }
        }
      } catch (_) {
        // ignore
      }
    };
    this.ws.addEventListener("message", onRes);
  }

  /** Call after open; if no connect.challenge arrives within 1.5s, send connect. */
  startHandshake(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const t = setTimeout(() => {
      if (this._state === "connecting" && this.ws?.readyState === WebSocket.OPEN) {
        this.sendConnect();
      }
    }, 1500);
    const onEvent = (ev: MessageEvent) => {
      try {
        const msg = JSON.parse(ev.data as string);
        if (msg.type === "event" && msg.event === "connect.challenge") {
          clearTimeout(t);
          this.ws?.removeEventListener("message", onEvent);
        }
      } catch (_) {
        // ignore
      }
    };
    this.ws.addEventListener("message", onEvent);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectParams = null;
    this.setState("disconnected");
  }

  private request<T>(method: string, params?: Record<string, unknown>): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error("Not connected"));
        return;
      }
      const id = nextId();
      this.pending.set(id, {
        resolve: (v) => resolve(v as T),
        reject,
      });
      this.ws.send(JSON.stringify({ type: "req", id, method, params }));
    });
  }

  async chatHistory(sessionKey?: string): Promise<{ messages?: { role: string; content: string }[] }> {
    return this.request("chat.history", sessionKey ? { sessionKey } : undefined);
  }

  async chatSend(params: ChatSendParams): Promise<ChatSendResult> {
    return this.request("chat.send", params);
  }

  async chatAbort(sessionKey?: string, runId?: string): Promise<void> {
    return this.request("chat.abort", { sessionKey, runId });
  }

  async sessionsList(): Promise<SessionsListPayload> {
    return this.request("sessions.list");
  }

  async channelsStatus(): Promise<ChannelsStatusPayload> {
    return this.request("channels.status");
  }

  async status(): Promise<StatusPayload> {
    return this.request("status");
  }

  async health(): Promise<unknown> {
    return this.request("health");
  }

  // Config
  async configGet(): Promise<unknown> {
    return this.request("config.get");
  }

  async configSet(payload: { config: unknown; baseHash?: string }): Promise<unknown> {
    return this.request("config.set", payload);
  }

  async configSchema(): Promise<unknown> {
    return this.request("config.schema");
  }

  async configApply(): Promise<unknown> {
    return this.request("config.apply");
  }

  // Cron
  async cronList(): Promise<{ jobs?: unknown[] }> {
    return this.request("cron.list");
  }

  async cronAdd(params: { schedule: string; delivery?: string; [k: string]: unknown }): Promise<unknown> {
    return this.request("cron.add", params);
  }

  async cronRun(params: { id: string }): Promise<unknown> {
    return this.request("cron.run", params);
  }

  async cronEnable(params: { id: string; enabled: boolean }): Promise<unknown> {
    return this.request("cron.patch", { id: params.id, enabled: params.enabled });
  }

  async cronDelete(params: { id: string }): Promise<unknown> {
    return this.request("cron.delete", params);
  }

  async cronHistory(params?: { id?: string; limit?: number }): Promise<unknown> {
    return this.request("cron.history", params);
  }

  // Skills
  async skillsStatus(): Promise<unknown> {
    return this.request("skills.status");
  }

  async skillsList(): Promise<{ skills?: unknown[] }> {
    return this.request("skills.list");
  }

  async skillsEnable(params: { id: string; enabled: boolean }): Promise<unknown> {
    return this.request("skills.patch", params);
  }

  async skillsInstall(params: { id: string; [k: string]: unknown }): Promise<unknown> {
    return this.request("skills.install", params);
  }

  // Nodes
  async nodeList(): Promise<{ nodes?: unknown[] }> {
    return this.request("node.list");
  }

  // Presence / instances
  async systemPresence(): Promise<unknown> {
    return this.request("system-presence");
  }

  // Models
  async modelsList(): Promise<{ models?: unknown[] }> {
    return this.request("models.list");
  }

  // Logs
  async logsTail(params?: { limit?: number; filter?: string }): Promise<unknown> {
    return this.request("logs.tail", params);
  }

  // Update
  async updateRun(): Promise<unknown> {
    return this.request("update.run");
  }

  // Exec approvals (operator.approvals scope)
  async execApprovalResolve(params: { requestId: string; allow: boolean }): Promise<unknown> {
    return this.request("exec.approval.resolve", params);
  }

  /** Generic request for any gateway method (e.g. config.patch, cron.patch). */
  async requestMethod<T = unknown>(method: string, params?: Record<string, unknown>): Promise<T> {
    return this.request<T>(method, params);
  }
}

export const gatewayClient = new GatewayClient();
