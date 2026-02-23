import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth-helpers";
import { isValidUUID, isValidCostRate } from "@/lib/validation";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const existing = await prisma.costRate.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Cost rate not found" }, { status: 404 });
  }

  const body = await req.json();
  const { inputPer1kTokens, outputPer1kTokens } = body as {
    inputPer1kTokens?: number;
    outputPer1kTokens?: number;
  };

  if (inputPer1kTokens !== undefined && !isValidCostRate(inputPer1kTokens)) {
    return NextResponse.json(
      { error: "inputPer1kTokens must be a number between 0 and 1000" },
      { status: 400 }
    );
  }

  if (outputPer1kTokens !== undefined && !isValidCostRate(outputPer1kTokens)) {
    return NextResponse.json(
      { error: "outputPer1kTokens must be a number between 0 and 1000" },
      { status: 400 }
    );
  }

  const rate = await prisma.costRate.update({
    where: { id },
    data: {
      ...(inputPer1kTokens !== undefined && { inputPer1kTokens }),
      ...(outputPer1kTokens !== undefined && { outputPer1kTokens }),
    },
  });

  return NextResponse.json(rate);
}
