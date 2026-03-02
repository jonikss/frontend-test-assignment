# Withdraw USDT — Frontend Test Assignment

USDT withdrawal page with mock API, double-submit protection, idempotency, form states, and tests.

**Live Demo:** https://frontend-test-assignment-ten.vercel.app/withdraw

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS v4**
- **Zustand** — state management with `sessionStorage` persistence
- **Vitest** + **Testing Library** — unit tests

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/withdraw`.

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start dev server         |
| `npm run build` | Production build         |
| `npm run lint`  | ESLint check             |
| `npm test`      | Run tests (Vitest)       |

## Project Structure

```
app/
  page.tsx                          — redirects to /withdraw
  layout.tsx                        — root layout with metadata
  withdraw/
    page.tsx                        — Withdraw page (client component)
  api/v1/withdrawals/
    _store.ts                       — in-memory store (Map)
    route.ts                        — POST /api/v1/withdrawals
    [id]/route.ts                   — GET /api/v1/withdrawals/{id}
lib/
  types/withdrawal.ts               — TypeScript types
  api/withdrawals.ts                — API client (fetch wrappers)
  store/withdrawal-store.ts         — Zustand store
  utils/idempotency.ts              — idempotency key generation
  auth/token.ts                     — mock auth token
__tests__/
  withdraw.test.tsx                 — 3 tests (happy path, error, double submit)
```

## Mock API

### POST `/api/v1/withdrawals`

Creates a withdrawal. Requires `Authorization` and `Idempotency-Key` headers.

| Status | Description                          |
| ------ | ------------------------------------ |
| 201    | Withdrawal created                   |
| 400    | Validation error                     |
| 401    | Missing authorization                |
| 409    | Duplicate idempotency key            |
| 500    | Simulated error (X-Mock-Error: 500)  |

### GET `/api/v1/withdrawals/{id}`

Returns withdrawal by ID. 200 or 404.

## Double Submit Protection

Three layers of protection:

1. **UI guard** — submit handler checks `status === "loading"` and returns early
2. **Disabled button** — submit button is disabled during loading
3. **Server idempotency** — duplicate `Idempotency-Key` returns 409 Conflict

## State Management

Zustand store manages withdrawal lifecycle (`idle → loading → success | error`).

- On error: idempotency key is preserved for retry with the same key
- On success: key is cleared, result is displayed
- `sessionStorage` persistence with 5-minute TTL for recovery after page reload

Form fields (amount, destination, confirm) are React local state — not persisted.

## Security Notes

- No `dangerouslySetInnerHTML`
- Auth token is a mock constant (`lib/auth/token.ts`)
- **Production approach**: httpOnly Secure cookie set by auth server, never stored in JS-accessible storage
- No secrets in localStorage/sessionStorage

## Tests

```bash
npm test
```

Three tests:

1. **Happy path** — fill form, submit, verify result is displayed
2. **API error** — submit returns 500, verify error message shown and form preserved
3. **Double submit** — verify button disabled during loading, fetch called only once
