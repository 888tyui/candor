import { describe, it, expect } from "vitest";
import {
  estimateTokens,
  estimateTokensFromJson,
  estimateCost,
  DEFAULT_COST_RATES,
} from "../lib/cost-estimation";

describe("estimateTokens", () => {
  it("estimates ~4 chars per token", () => {
    expect(estimateTokens("hello")).toBe(2); // ceil(5/4)
    expect(estimateTokens("a".repeat(100))).toBe(25);
    expect(estimateTokens("a".repeat(101))).toBe(26);
  });

  it("returns 0 for empty/null/undefined", () => {
    expect(estimateTokens("")).toBe(0);
    expect(estimateTokens(null)).toBe(0);
    expect(estimateTokens(undefined)).toBe(0);
  });
});

describe("estimateTokensFromJson", () => {
  it("serializes objects and estimates tokens", () => {
    const obj = { key: "value", num: 42 };
    const json = JSON.stringify(obj);
    expect(estimateTokensFromJson(obj)).toBe(Math.ceil(json.length / 4));
  });

  it("handles strings directly", () => {
    expect(estimateTokensFromJson("hello world")).toBe(Math.ceil(11 / 4));
  });

  it("returns 0 for falsy values", () => {
    expect(estimateTokensFromJson(null)).toBe(0);
    expect(estimateTokensFromJson(undefined)).toBe(0);
  });
});

describe("estimateCost", () => {
  const rates = [
    { provider: "anthropic", model: "claude-sonnet-4", inputPer1kTokens: 0.003, outputPer1kTokens: 0.015 },
    { provider: "openai", model: "gpt-4o", inputPer1kTokens: 0.0025, outputPer1kTokens: 0.01 },
  ];

  it("calculates cost correctly for known model", () => {
    // 1000 input tokens + 500 output tokens for claude-sonnet-4
    // = (1000/1000)*0.003 + (500/1000)*0.015 = 0.003 + 0.0075 = 0.0105
    const cost = estimateCost(rates, "anthropic", "claude-sonnet-4", 1000, 500);
    expect(cost).toBeCloseTo(0.0105, 6);
  });

  it("is case-insensitive for provider/model", () => {
    const cost = estimateCost(rates, "Anthropic", "Claude-Sonnet-4", 1000, 0);
    expect(cost).toBeCloseTo(0.003, 6);
  });

  it("returns 0 for unknown model", () => {
    expect(estimateCost(rates, "anthropic", "unknown-model", 1000, 500)).toBe(0);
  });

  it("returns 0 for missing provider/model", () => {
    expect(estimateCost(rates, undefined, undefined, 1000, 500)).toBe(0);
    expect(estimateCost(rates, "anthropic", undefined, 1000, 500)).toBe(0);
  });
});

describe("DEFAULT_COST_RATES", () => {
  it("has entries for 5 models", () => {
    expect(DEFAULT_COST_RATES).toHaveLength(5);
  });

  it("all rates are positive numbers", () => {
    for (const rate of DEFAULT_COST_RATES) {
      expect(rate.inputPer1kTokens).toBeGreaterThan(0);
      expect(rate.outputPer1kTokens).toBeGreaterThan(0);
      expect(rate.provider).toBeTruthy();
      expect(rate.model).toBeTruthy();
    }
  });
});
