import { prisma } from "./db";

/* ─── Token Counting Heuristic ─── */

export function estimateTokens(text: string | undefined | null): number {
  if (!text) return 0;
  // ~4 chars per token for English text (rough heuristic)
  return Math.ceil(text.length / 4);
}

export function estimateTokensFromJson(
  data: unknown
): number {
  if (!data) return 0;
  const text = typeof data === "string" ? data : JSON.stringify(data);
  return estimateTokens(text);
}

/* ─── Cost Lookup ─── */

interface CostRateEntry {
  provider: string;
  model: string;
  inputPer1kTokens: number;
  outputPer1kTokens: number;
}

// In-memory cache for cost rates per user
const rateCache = new Map<string, { rates: CostRateEntry[]; fetchedAt: number }>();
const CACHE_TTL_MS = 60_000; // 1 minute

export async function getCostRates(userId: string): Promise<CostRateEntry[]> {
  const cached = rateCache.get(userId);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.rates;
  }
  const rates = await prisma.costRate.findMany({
    where: { userId },
    select: { provider: true, model: true, inputPer1kTokens: true, outputPer1kTokens: true },
  });
  rateCache.set(userId, { rates, fetchedAt: Date.now() });
  return rates;
}

export function estimateCost(
  rates: CostRateEntry[],
  provider: string | undefined,
  model: string | undefined,
  inputTokens: number,
  outputTokens: number
): number {
  if (!provider || !model) return 0;
  const rate = rates.find(
    (r) =>
      r.provider.toLowerCase() === provider.toLowerCase() &&
      r.model.toLowerCase() === model.toLowerCase()
  );
  if (!rate) return 0;
  return (
    (inputTokens / 1000) * rate.inputPer1kTokens +
    (outputTokens / 1000) * rate.outputPer1kTokens
  );
}

/* ─── Default Cost Rates ─── */

export const DEFAULT_COST_RATES: Omit<CostRateEntry, "userId">[] = [
  { provider: "anthropic", model: "claude-opus-4", inputPer1kTokens: 0.015, outputPer1kTokens: 0.075 },
  { provider: "anthropic", model: "claude-sonnet-4", inputPer1kTokens: 0.003, outputPer1kTokens: 0.015 },
  { provider: "anthropic", model: "claude-haiku-4", inputPer1kTokens: 0.0008, outputPer1kTokens: 0.004 },
  { provider: "openai", model: "gpt-4o", inputPer1kTokens: 0.0025, outputPer1kTokens: 0.01 },
  { provider: "openai", model: "gpt-4o-mini", inputPer1kTokens: 0.00015, outputPer1kTokens: 0.0006 },
];
