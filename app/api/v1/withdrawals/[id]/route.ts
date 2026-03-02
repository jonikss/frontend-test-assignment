import { NextRequest, NextResponse } from "next/server";
import { withdrawals } from "../_store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const withdrawal = withdrawals.get(id);

  if (!withdrawal) {
    return NextResponse.json(
      { error: "Withdrawal not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(withdrawal, { status: 200 });
}
