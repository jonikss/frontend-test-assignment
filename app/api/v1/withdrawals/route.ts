import { NextRequest, NextResponse } from "next/server";
import { withdrawals, idempotencyKeys } from "./_store";
import type { Withdrawal } from "@/lib/types/withdrawal";

export async function POST(request: NextRequest) {
  // Simulate server error when X-Mock-Error header is present
  if (request.headers.get("X-Mock-Error") === "500") {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const idempotencyKey = request.headers.get("Idempotency-Key");
  if (!idempotencyKey) {
    return NextResponse.json(
      { error: "Idempotency-Key header is required" },
      { status: 400 },
    );
  }

  // Check for duplicate submission
  const existingId = idempotencyKeys.get(idempotencyKey);
  if (existingId) {
    const existing = withdrawals.get(existingId);
    return NextResponse.json(
      {
        error: "This withdrawal request has already been submitted",
        withdrawal: existing,
      },
      { status: 409 },
    );
  }

  const body = await request.json();
  const { amount, destination, currency } = body;

  // Validation
  if (!amount || typeof amount !== "number" || amount <= 0) {
    return NextResponse.json(
      { error: "Amount must be a positive number" },
      { status: 400 },
    );
  }

  if (!destination || typeof destination !== "string" || !destination.trim()) {
    return NextResponse.json(
      { error: "Destination address is required" },
      { status: 400 },
    );
  }

  if (currency !== "USDT") {
    return NextResponse.json(
      { error: "Only USDT currency is supported" },
      { status: 400 },
    );
  }

  // Simulate processing delay for visible loading state
  await new Promise((resolve) => setTimeout(resolve, 500));

  const withdrawal: Withdrawal = {
    id: crypto.randomUUID(),
    amount,
    destination: destination.trim(),
    currency,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  withdrawals.set(withdrawal.id, withdrawal);
  idempotencyKeys.set(idempotencyKey, withdrawal.id);

  return NextResponse.json(withdrawal, { status: 201 });
}
