/** Input validation helpers */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}

export function parsePositiveInt(value: string | null, defaultValue: number, max: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < 1) return defaultValue;
  return Math.min(parsed, max);
}

export function isValidISODate(value: string): boolean {
  const date = new Date(value);
  return !isNaN(date.getTime());
}

const VALID_PERIODS = ["1h", "24h", "7d", "30d"] as const;
export type ValidPeriod = (typeof VALID_PERIODS)[number];

export function isValidPeriod(value: string): value is ValidPeriod {
  return (VALID_PERIODS as readonly string[]).includes(value);
}

/** Block SSRF: reject internal/private IPs in webhook URLs */
export function isAllowedWebhookUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    const hostname = url.hostname.toLowerCase();
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0") return false;
    if (hostname === "[::1]" || hostname.startsWith("10.")) return false;
    if (hostname.startsWith("172.") && /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)) return false;
    if (hostname.startsWith("192.168.")) return false;
    if (hostname.startsWith("169.254.")) return false;
    if (hostname.endsWith(".internal") || hostname.endsWith(".local")) return false;
    return true;
  } catch {
    return false;
  }
}

const VALID_CONDITION_TYPES = [
  "error_rate", "latency", "cost_spike", "tool_failure", "session_duration", "event_count"
] as const;

export interface AlertConditionInput {
  type: string;
  threshold: number;
  window?: number;
  toolName?: string;
}

export function isValidAlertCondition(condition: unknown): condition is AlertConditionInput {
  if (!condition || typeof condition !== "object") return false;
  const c = condition as Record<string, unknown>;
  if (typeof c.type !== "string") return false;
  if (!(VALID_CONDITION_TYPES as readonly string[]).includes(c.type)) return false;
  if (typeof c.threshold !== "number" || !isFinite(c.threshold) || c.threshold < 0) return false;
  if (c.window !== undefined && (typeof c.window !== "number" || c.window < 1 || c.window > 86400)) return false;
  if (c.toolName !== undefined && typeof c.toolName !== "string") return false;
  // Limit nesting depth: condition should be a flat object
  for (const val of Object.values(c)) {
    if (val !== null && typeof val === "object") return false;
  }
  return true;
}

export function isValidCostRate(value: unknown): boolean {
  if (typeof value !== "number") return false;
  if (!isFinite(value)) return false;
  if (value < 0 || value > 1000) return false; // $0 to $1000 per 1k tokens max
  return true;
}
