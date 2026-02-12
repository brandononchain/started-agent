/** StartedAI / Started Agent — WebSocket protocol types (protocol version 3). */

export const PROTOCOL_VERSION = 3;

export type WsRequest = {
  type: "req";
  id: string;
  method: string;
  params?: Record<string, unknown>;
};

export type WsResponse = {
  type: "res";
  id: string;
  ok: boolean;
  payload?: unknown;
  error?: string;
};

export type WsEvent = {
  type: "event";
  event: string;
  payload?: unknown;
  seq?: number;
  stateVersion?: number;
};

export type ConnectParams = {
  minProtocol: number;
  maxProtocol: number;
  client: { id: string; version: string; platform: string; mode: "operator" };
  role: "operator";
  scopes: string[];
  auth?: { token?: string; password?: string };
  locale?: string;
  userAgent?: string;
};

export type HelloOkPayload = {
  type: "hello-ok";
  protocol: number;
  policy?: { tickIntervalMs?: number };
  auth?: { deviceToken?: string; role?: string; scopes?: string[] };
};
