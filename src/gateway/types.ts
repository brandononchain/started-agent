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

export type WsMessage = WsRequest | WsResponse | WsEvent;

export type ConnectParams = {
  minProtocol: number;
  maxProtocol: number;
  client: {
    id: string;
    version: string;
    platform: string;
    mode: "operator";
  };
  role: "operator";
  scopes: string[];
  caps?: string[];
  commands?: string[];
  permissions?: Record<string, boolean>;
  auth?: { token?: string; password?: string };
  locale?: string;
  userAgent?: string;
};

export type HelloOkPayload = {
  type: "hello-ok";
  protocol: number;
  policy?: { tickIntervalMs?: number };
  auth?: {
    deviceToken?: string;
    role?: string;
    scopes?: string[];
  };
};

export type ConnectChallengePayload = {
  nonce: string;
  ts: number;
};

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  id?: string;
  runId?: string;
};

export type ChatHistoryPayload = {
  sessionKey?: string;
  messages?: ChatMessage[];
};

export type ChatSendParams = {
  sessionKey?: string;
  content: string;
  idempotencyKey?: string;
};

export type ChatSendResult = {
  runId?: string;
  status: "started" | "ok" | "in_flight";
};

export type SessionEntry = {
  key: string;
  model?: string;
  thinkingLevel?: string;
  verboseLevel?: boolean;
  [k: string]: unknown;
};

export type SessionsListPayload = {
  sessions?: SessionEntry[];
};

export type ChannelStatus = {
  channel: string;
  status?: string;
  connected?: boolean;
  [k: string]: unknown;
};

export type ChannelsStatusPayload = {
  channels?: Record<string, ChannelStatus>;
};

export type StatusPayload = {
  version?: string;
  [k: string]: unknown;
};
