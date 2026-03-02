import type {
  Withdrawal,
  WithdrawalRequest,
  ApiResult,
} from "@/lib/types/withdrawal";
import { MOCK_AUTH_TOKEN } from "@/lib/auth/token";

export async function createWithdrawal(
  data: WithdrawalRequest,
  idempotencyKey: string,
): Promise<ApiResult<Withdrawal>> {
  try {
    const res = await fetch("/api/v1/withdrawals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MOCK_AUTH_TOKEN}`,
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (res.ok) {
      return { ok: true, data: json as Withdrawal };
    }

    return { ok: false, error: json.error ?? "Unknown error", status: res.status };
  } catch {
    return { ok: false, error: "Network error. Please check your connection.", status: 0 };
  }
}

export async function getWithdrawal(id: string): Promise<ApiResult<Withdrawal>> {
  try {
    const res = await fetch(`/api/v1/withdrawals/${id}`, {
      headers: {
        Authorization: `Bearer ${MOCK_AUTH_TOKEN}`,
      },
    });

    const json = await res.json();

    if (res.ok) {
      return { ok: true, data: json as Withdrawal };
    }

    return { ok: false, error: json.error ?? "Unknown error", status: res.status };
  } catch {
    return { ok: false, error: "Network error. Please check your connection.", status: 0 };
  }
}
