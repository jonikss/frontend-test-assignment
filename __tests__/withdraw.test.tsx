import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import WithdrawPage from "@/app/withdraw/page";
import { useWithdrawalStore } from "@/lib/store/withdrawal-store";

beforeEach(() => {
  vi.restoreAllMocks();
  // Reset zustand store between tests
  useWithdrawalStore.setState({
    status: "idle",
    idempotencyKey: null,
    lastWithdrawal: null,
    errorMessage: null,
  });
});

function mockFetchSuccess() {
  global.fetch = vi.fn().mockResolvedValueOnce({
    ok: true,
    status: 201,
    json: async () => ({
      id: "test-uuid-123",
      amount: 100,
      destination: "TRC20walletAddress",
      currency: "USDT",
      status: "pending",
      createdAt: "2025-01-01T00:00:00.000Z",
    }),
  });
}

function mockFetchError500() {
  global.fetch = vi.fn().mockResolvedValueOnce({
    ok: false,
    status: 500,
    json: async () => ({
      error: "Internal server error",
    }),
  });
}

describe("Withdraw Page", () => {
  it("happy path: submits form and displays withdrawal result", async () => {
    const user = userEvent.setup();
    mockFetchSuccess();

    render(<WithdrawPage />);

    await user.type(screen.getByLabelText(/amount/i), "100");
    await user.type(screen.getByLabelText(/destination/i), "TRC20walletAddress");
    await user.click(screen.getByLabelText(/i confirm/i));
    await user.click(screen.getByRole("button", { name: /submit withdrawal/i }));

    await waitFor(() => {
      expect(screen.getByText("Withdrawal Submitted")).toBeInTheDocument();
    });

    expect(screen.getByText("test-uuid-123")).toBeInTheDocument();
    expect(screen.getByText(/100 USDT/)).toBeInTheDocument();
    expect(screen.getByText("TRC20walletAddress")).toBeInTheDocument();
  });

  it("API error: shows error message and preserves form", async () => {
    const user = userEvent.setup();
    mockFetchError500();

    render(<WithdrawPage />);

    await user.type(screen.getByLabelText(/amount/i), "50");
    await user.type(screen.getByLabelText(/destination/i), "SomeWallet");
    await user.click(screen.getByLabelText(/i confirm/i));
    await user.click(screen.getByRole("button", { name: /submit withdrawal/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Internal server error");
    });

    // Form values should be preserved
    expect(screen.getByLabelText(/amount/i)).toHaveValue(50);
    expect(screen.getByLabelText(/destination/i)).toHaveValue("SomeWallet");
  });

  it("double submit: button is disabled during loading, fetch called once", async () => {
    const user = userEvent.setup();

    // Simulate a slow response
    global.fetch = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                status: 201,
                json: async () => ({
                  id: "test-uuid-456",
                  amount: 200,
                  destination: "AnotherWallet",
                  currency: "USDT",
                  status: "pending",
                  createdAt: "2025-01-01T00:00:00.000Z",
                }),
              }),
            200,
          ),
        ),
    );

    render(<WithdrawPage />);

    await user.type(screen.getByLabelText(/amount/i), "200");
    await user.type(screen.getByLabelText(/destination/i), "AnotherWallet");
    await user.click(screen.getByLabelText(/i confirm/i));

    const submitButton = screen.getByRole("button", { name: /submit withdrawal/i });
    await user.click(submitButton);

    // Button should be disabled during loading
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /processing/i })).toBeDisabled();
    });

    // Attempt second click — should not go through
    await user.click(screen.getByRole("button", { name: /processing/i }));

    // Only one fetch call should have been made
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText("Withdrawal Submitted")).toBeInTheDocument();
    });
  });
});
