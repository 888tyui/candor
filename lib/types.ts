/* ─── WebSocket Message Types ─── */

export type WSMessageType =
  | "subscribe"
  | "unsubscribe"
  | "event"
  | "session:start"
  | "session:end"
  | "alert"
  | "ping"
  | "pong";

export interface WSMessage {
  type: WSMessageType;
  payload?: unknown;
}

export interface WSSubscribePayload {
  userId: string;
  sessionIds?: string[];
}

export interface MCPEventPayload {
  id: string;
  sessionId: string;
  timestamp: string;
  direction: "request" | "response";
  method?: string;
  toolName?: string;
  params?: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: Record<string, unknown>;
  latencyMs?: number;
  tokenEstimate?: number;
  costEstimate?: number;
}

export interface SessionStartPayload {
  id: string;
  agentId?: string;
  startedAt: string;
  metadata?: Record<string, unknown>;
}

export interface SessionEndPayload {
  id: string;
  endedAt: string;
  totalCostEstimate: number;
}

export interface AlertPayload {
  id: string;
  ruleId: string;
  ruleName: string;
  sessionId: string;
  eventId?: string;
  message: string;
  severity: "info" | "warning" | "critical";
  createdAt: string;
}

/* ─── Config Types ─── */

export interface UpstreamConfig {
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  transport: "stdio" | "sse";
  url?: string; // for SSE transport
}

export interface CandorConfig {
  port: number;
  wsPort: number;
  dashboardUrl?: string;
  storage: "postgres" | "memory";
  databaseUrl?: string;
  upstreams: UpstreamConfig[];
  logRetentionDays: number;
  maxEventsPerSession: number;
  verbose: boolean;
}

/* ─── API Response Types ─── */

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface StatsResponse {
  totalSessions: number;
  activeSessions: number;
  totalEvents: number;
  totalCost: number;
  errorRate: number;
  avgLatencyMs: number;
  topTools: { toolName: string; count: number; totalCost: number }[];
  costByPeriod: { period: string; cost: number }[];
}
