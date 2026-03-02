import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Withdrawal } from "@/lib/types/withdrawal";
import { createWithdrawal, getWithdrawal } from "@/lib/api/withdrawals";
import { generateIdempotencyKey } from "@/lib/utils/idempotency";

export type WithdrawalStatus = "idle" | "loading" | "success" | "error";

interface WithdrawalState {
  status: WithdrawalStatus;
  idempotencyKey: string | null;
  lastWithdrawal: Withdrawal | null;
  errorMessage: string | null;

  submit: (amount: number, destination: string) => Promise<void>;
  checkStatus: () => Promise<void>;
  reset: () => void;
}

const SESSION_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const useWithdrawalStore = create<WithdrawalState>()(
  persist(
    (set, get) => ({
      status: "idle",
      idempotencyKey: null,
      lastWithdrawal: null,
      errorMessage: null,

      submit: async (amount: number, destination: string) => {
        const state = get();

        // Guard: prevent double submit
        if (state.status === "loading") return;

        // Reuse key on retry, generate new one otherwise
        const key = state.idempotencyKey ?? generateIdempotencyKey();

        set({ status: "loading", idempotencyKey: key, errorMessage: null });

        const result = await createWithdrawal(
          { amount, destination, currency: "USDT" },
          key,
        );

        if (result.ok) {
          set({
            status: "success",
            lastWithdrawal: result.data,
            idempotencyKey: null,
            errorMessage: null,
          });
        } else {
          const message =
            result.status === 409
              ? "This withdrawal request has already been submitted"
              : result.error;

          set({
            status: "error",
            errorMessage: message,
            // Keep idempotency key for retry on network/server errors,
            // but clear it on 409 (conflict) since the request was processed
            idempotencyKey: result.status === 409 ? null : key,
          });
        }
      },

      checkStatus: async () => {
        const { lastWithdrawal } = get();
        if (!lastWithdrawal) return;

        const result = await getWithdrawal(lastWithdrawal.id);
        if (result.ok) {
          set({ lastWithdrawal: result.data });
        }
      },

      reset: () => {
        set({
          status: "idle",
          idempotencyKey: null,
          lastWithdrawal: null,
          errorMessage: null,
        });
      },
    }),
    {
      name: "withdrawal-store",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          // SSR: return a no-op storage
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return sessionStorage;
      }),
      // Expire persisted state after 5 minutes
      merge: (persisted, current) => {
        const state = persisted as WithdrawalState & { _timestamp?: number };
        if (state?._timestamp && Date.now() - state._timestamp > SESSION_TTL_MS) {
          return current;
        }
        return { ...current, ...state };
      },
      partialize: (state) => ({
        ...state,
        // Add timestamp for TTL check
        _timestamp: Date.now(),
        // Don't persist functions
        submit: undefined,
        checkStatus: undefined,
        reset: undefined,
      }),
    },
  ),
);
