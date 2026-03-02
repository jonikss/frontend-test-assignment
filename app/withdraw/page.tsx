"use client";

import { useState } from "react";
import { useWithdrawalStore } from "@/lib/store/withdrawal-store";

export default function WithdrawPage() {
  const { status, lastWithdrawal, errorMessage, submit, checkStatus, reset } =
    useWithdrawalStore();

  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");
  const [confirm, setConfirm] = useState(false);

  const parsedAmount = parseFloat(amount);
  const isFormValid =
    !isNaN(parsedAmount) &&
    parsedAmount > 0 &&
    destination.trim().length > 0 &&
    confirm;

  const isSubmitDisabled = !isFormValid || status === "loading";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Guard: prevent double submit
    if (status === "loading") return;

    await submit(parsedAmount, destination.trim());
  }

  function handleNewWithdrawal() {
    reset();
    setAmount("");
    setDestination("");
    setConfirm(false);
  }

  // Success state
  if (status === "success" && lastWithdrawal) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg dark:bg-zinc-900">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Withdrawal Submitted
            </h1>
          </div>

          <div className="space-y-3 rounded-xl bg-zinc-50 p-4 text-sm dark:bg-zinc-800">
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">ID</span>
              <span className="font-mono text-xs text-zinc-900 dark:text-zinc-100">
                {lastWithdrawal.id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">Amount</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {lastWithdrawal.amount} {lastWithdrawal.currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">Destination</span>
              <span className="font-mono text-xs text-zinc-900 dark:text-zinc-100">
                {lastWithdrawal.destination}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">Status</span>
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                {lastWithdrawal.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">Created</span>
              <span className="text-zinc-900 dark:text-zinc-100">
                {new Date(lastWithdrawal.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={checkStatus}
              className="flex-1 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Check Status
            </button>
            <button
              type="button"
              onClick={handleNewWithdrawal}
              className="flex-1 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              New Withdrawal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Idle / Loading / Error — show form
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg dark:bg-zinc-900">
        <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Withdraw USDT
        </h1>

        {status === "error" && errorMessage && (
          <div
            role="alert"
            className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400"
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="amount"
              className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Amount (USDT)
            </label>
            <input
              id="amount"
              type="number"
              step="any"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={status === "loading"}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-500"
            />
          </div>

          <div>
            <label
              htmlFor="destination"
              className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Destination Address
            </label>
            <input
              id="destination"
              type="text"
              placeholder="Enter wallet address"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              disabled={status === "loading"}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-500"
            />
          </div>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={confirm}
              onChange={(e) => setConfirm(e.target.checked)}
              disabled={status === "loading"}
              className="mt-0.5 h-4 w-4 rounded border-zinc-300 accent-zinc-900 dark:border-zinc-600 dark:accent-zinc-100"
            />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              I confirm the withdrawal details are correct
            </span>
          </label>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {status === "loading" ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Processing...
              </>
            ) : (
              "Submit Withdrawal"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
