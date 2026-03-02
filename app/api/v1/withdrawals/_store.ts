import type { Withdrawal } from "@/lib/types/withdrawal";

// Module-level Map survives across requests in dev, resets on server restart.
export const withdrawals = new Map<string, Withdrawal>();

// Maps idempotency keys to withdrawal IDs to detect duplicate submissions.
export const idempotencyKeys = new Map<string, string>();
