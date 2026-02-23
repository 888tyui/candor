import { describe, it, expect } from "vitest";
import {
  isValidUUID,
  parsePositiveInt,
  isValidISODate,
  isValidPeriod,
  isAllowedWebhookUrl,
  isValidAlertCondition,
  isValidCostRate,
} from "../lib/validation";

describe("isValidUUID", () => {
  it("accepts valid UUIDs", () => {
    expect(isValidUUID("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    expect(isValidUUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")).toBe(true);
  });

  it("rejects invalid strings", () => {
    expect(isValidUUID("")).toBe(false);
    expect(isValidUUID("not-a-uuid")).toBe(false);
    expect(isValidUUID("550e8400-e29b-41d4-a716")).toBe(false);
    expect(isValidUUID("550e8400e29b41d4a716446655440000")).toBe(false);
    expect(isValidUUID("550e8400-e29b-41d4-a716-44665544000g")).toBe(false);
  });
});

describe("parsePositiveInt", () => {
  it("returns default for null", () => {
    expect(parsePositiveInt(null, 10, 100)).toBe(10);
  });

  it("parses valid integers", () => {
    expect(parsePositiveInt("5", 10, 100)).toBe(5);
    expect(parsePositiveInt("50", 10, 100)).toBe(50);
  });

  it("clamps to max", () => {
    expect(parsePositiveInt("200", 10, 100)).toBe(100);
  });

  it("returns default for invalid values", () => {
    expect(parsePositiveInt("abc", 10, 100)).toBe(10);
    expect(parsePositiveInt("0", 10, 100)).toBe(10);
    expect(parsePositiveInt("-1", 10, 100)).toBe(10);
  });
});

describe("isValidISODate", () => {
  it("accepts valid ISO dates", () => {
    expect(isValidISODate("2024-01-15T10:30:00Z")).toBe(true);
    expect(isValidISODate("2024-01-15")).toBe(true);
  });

  it("rejects invalid dates", () => {
    expect(isValidISODate("not-a-date")).toBe(false);
    expect(isValidISODate("")).toBe(false);
  });
});

describe("isValidPeriod", () => {
  it("accepts valid periods", () => {
    expect(isValidPeriod("1h")).toBe(true);
    expect(isValidPeriod("24h")).toBe(true);
    expect(isValidPeriod("7d")).toBe(true);
    expect(isValidPeriod("30d")).toBe(true);
  });

  it("rejects invalid periods", () => {
    expect(isValidPeriod("2h")).toBe(false);
    expect(isValidPeriod("1d")).toBe(false);
    expect(isValidPeriod("")).toBe(false);
  });
});

describe("isAllowedWebhookUrl", () => {
  it("allows public HTTPS URLs", () => {
    expect(isAllowedWebhookUrl("https://hooks.slack.com/services/xxx")).toBe(true);
    expect(isAllowedWebhookUrl("https://api.example.com/webhook")).toBe(true);
  });

  it("allows HTTP for non-private hosts", () => {
    expect(isAllowedWebhookUrl("http://api.example.com/hook")).toBe(true);
  });

  it("blocks localhost and loopback", () => {
    expect(isAllowedWebhookUrl("http://localhost:3000/hook")).toBe(false);
    expect(isAllowedWebhookUrl("http://127.0.0.1:8080/hook")).toBe(false);
    expect(isAllowedWebhookUrl("http://0.0.0.0/hook")).toBe(false);
    expect(isAllowedWebhookUrl("http://[::1]/hook")).toBe(false);
  });

  it("blocks private RFC1918 ranges", () => {
    expect(isAllowedWebhookUrl("http://10.0.0.1/hook")).toBe(false);
    expect(isAllowedWebhookUrl("http://172.16.0.1/hook")).toBe(false);
    expect(isAllowedWebhookUrl("http://172.31.255.255/hook")).toBe(false);
    expect(isAllowedWebhookUrl("http://192.168.1.1/hook")).toBe(false);
  });

  it("blocks AWS metadata endpoint", () => {
    expect(isAllowedWebhookUrl("http://169.254.169.254/latest/meta-data")).toBe(false);
  });

  it("blocks .internal and .local domains", () => {
    expect(isAllowedWebhookUrl("http://service.internal/hook")).toBe(false);
    expect(isAllowedWebhookUrl("http://myhost.local/hook")).toBe(false);
  });

  it("blocks non-HTTP protocols", () => {
    expect(isAllowedWebhookUrl("ftp://example.com/file")).toBe(false);
    expect(isAllowedWebhookUrl("file:///etc/passwd")).toBe(false);
  });

  it("handles malformed URLs", () => {
    expect(isAllowedWebhookUrl("not-a-url")).toBe(false);
    expect(isAllowedWebhookUrl("")).toBe(false);
  });

  it("allows 172.x outside of private range", () => {
    expect(isAllowedWebhookUrl("http://172.32.0.1/hook")).toBe(true);
    expect(isAllowedWebhookUrl("http://172.15.0.1/hook")).toBe(true);
  });
});

describe("isValidAlertCondition", () => {
  it("accepts valid conditions", () => {
    expect(isValidAlertCondition({ type: "error_rate", threshold: 0.5 })).toBe(true);
    expect(isValidAlertCondition({ type: "latency", threshold: 5000, window: 300 })).toBe(true);
    expect(isValidAlertCondition({ type: "tool_failure", threshold: 1, toolName: "read_file" })).toBe(true);
  });

  it("rejects invalid type", () => {
    expect(isValidAlertCondition({ type: "unknown_type", threshold: 1 })).toBe(false);
    expect(isValidAlertCondition({ type: 42, threshold: 1 })).toBe(false);
  });

  it("rejects invalid threshold", () => {
    expect(isValidAlertCondition({ type: "latency", threshold: -1 })).toBe(false);
    expect(isValidAlertCondition({ type: "latency", threshold: Infinity })).toBe(false);
    expect(isValidAlertCondition({ type: "latency", threshold: NaN })).toBe(false);
    expect(isValidAlertCondition({ type: "latency", threshold: "100" })).toBe(false);
  });

  it("rejects invalid window", () => {
    expect(isValidAlertCondition({ type: "latency", threshold: 100, window: 0 })).toBe(false);
    expect(isValidAlertCondition({ type: "latency", threshold: 100, window: 100000 })).toBe(false);
  });

  it("rejects nested objects (prevents JSON injection)", () => {
    expect(
      isValidAlertCondition({
        type: "latency",
        threshold: 100,
        extra: { nested: "object" },
      })
    ).toBe(false);
  });

  it("rejects null and non-objects", () => {
    expect(isValidAlertCondition(null)).toBe(false);
    expect(isValidAlertCondition(undefined)).toBe(false);
    expect(isValidAlertCondition("string")).toBe(false);
    expect(isValidAlertCondition(42)).toBe(false);
  });
});

describe("isValidCostRate", () => {
  it("accepts valid rates", () => {
    expect(isValidCostRate(0)).toBe(true);
    expect(isValidCostRate(0.003)).toBe(true);
    expect(isValidCostRate(1000)).toBe(true);
  });

  it("rejects out-of-range values", () => {
    expect(isValidCostRate(-1)).toBe(false);
    expect(isValidCostRate(1001)).toBe(false);
  });

  it("rejects non-numbers", () => {
    expect(isValidCostRate("0.003")).toBe(false);
    expect(isValidCostRate(Infinity)).toBe(false);
    expect(isValidCostRate(NaN)).toBe(false);
    expect(isValidCostRate(null)).toBe(false);
  });
});
