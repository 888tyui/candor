import { prisma } from "./db";
import { DEFAULT_COST_RATES } from "./cost-estimation";

export async function seedCostRatesForUser(userId: string): Promise<void> {
  const existing = await prisma.costRate.count({ where: { userId } });
  if (existing > 0) return;

  await prisma.costRate.createMany({
    data: DEFAULT_COST_RATES.map((rate) => ({
      userId,
      ...rate,
    })),
  });
}
