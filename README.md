# Meridian Banking - Methavee

- Deployed: https://methavee-dbs.pages.dev
- Run locally: `npm install && npm run dev`

## Project structure

```
src/
  api/          typed fetch client, types, RTK Query endpoints, demo URL params
  components/   shared UI (Skeleton)
  features/     dashboard/, headers/, theme/, transfer/ - each owns its components, hooks and tests
  lib/          money/date formatting, selectors (totals and limits, in cents)
  styles/       base, header, dashboard, transfer CSS (design tokens only)
  test/         test setup and render helper
```

## Decisions and trade-offs

- **RTK Query instead of the starter's TanStack Query.** I know it well enough to explain and change it live. It handles caching, loading/error states and refetching (E2). Totals and the remaining limit are worked out each render, never stored.
- **Zustand for theme and segment.** Two preferences that must survive a reload, and `persist` saves them in one line. The theme is only saved once the user presses the toggle, so until then the app follows the system setting. A script in `index.html` applies both before the first paint.
- **Search filters the 8 loaded rows in the browser.** It's instant, with no requests and no loading state. Trade-off: older transactions can't be found.
- **After a transfer, refetch, then show success.** Customer, accounts and transactions are refetched before "Transfer sent" appears. The server stays the only source of truth, and the dashboard is already correct when success shows (wireframe §6). Cost: about 0.5 s longer before the success screen.
- **One form for all three steps, one Zod schema.** `Back` keeps everything entered. Each rule is defined once, in a schema built from the live balance and limit. `Continue` checks only the current step and focuses the first error.
- **No double sends.** The button is disabled while sending, and a ref blocks fast repeat clicks. `Esc` and `✕` are blocked mid-send. There's a short click pause after each step, so a double click can't skip the review.
- **Native `<dialog>`** gives focus handling and `Esc` with no library. It becomes a full-screen sheet below 1024 px.
- **Demo states come from URL params instead of a debug menu,** so there's no "break the app" control in the UI.

## Loading, empty and error states

| State | How to see it on the deployed site |
| --- | --- |
| Loading skeleton | `?delay=3000` |
| Dashboard error + `Retry` | `?scenario=error` |
| Empty lists | `?scenario=empty` |
| No search matches | search for `zzz` |
| Field errors | `Continue` with empty fields, or an amount over the balance |
| Failed transfer, data kept | put `#fail` in the note |

## Tests

45 tests (`npm test`). The three required ones, each with its edge cases:

1. **Amount over balance** (`TransferDialog.test.tsx`): 1 cent over shows the error on the field and sends no request. Exactly the balance is accepted.
2. **Successful transfer** (same file): `Sending…`, then success with the reference, one request with the right body, and the dashboard balance, total, transactions and limit all updated. A `#fail` note keeps the user on review and moves no money.
3. **Dashboard error and `Retry`** (`Dashboard.test.tsx`): covered for each of the three requests, plus a retry that fails again.

They test through the real UI and the mock API, at the points where a bug costs money or trust. I broke each feature on purpose to confirm its test fails. Other tests cover the demo URL params and the theme store.

## AI use

I used **Claude Code** for planning, code, tests, CSS and review. Places where I changed or rejected its output:

1. **RTK Query over TanStack Query.** Its plan used the starter's TanStack Query. I switched to RTK Query, which I am more familiar with.
2. **A vague build plan.** Its steps didn't say why (for example, "disabled nav links"). I had it rewritten as plain tasks with reasons.
3. **Refetching before success.** It suggested invalidating the queries, which refreshes the dashboard after the success screen. I kept a refetch that finishes first.

## Not done / known issues

- `Retry` shows no loading feedback; the error stays until the response arrives.
- Not checked on a real phone, only at 360 and 390 px in a desktop browser.
- Focus returning to `New transfer` relies on the native dialog and isn't covered by tests.
- Skipped optional extras: discard confirmation, balance hiding, `#transfer` link, an end-to-end test, CI. The daily-limit progress bar is built.
