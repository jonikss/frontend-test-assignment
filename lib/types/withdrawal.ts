export interface WithdrawalRequest {
  amount: number;
  destination: string;
  currency: "USDT";
}

export interface Withdrawal {
  id: string;
  amount: number;
  destination: string;
  currency: "USDT";
  status: "pending" | "completed" | "failed";
  createdAt: string;
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status: number };
