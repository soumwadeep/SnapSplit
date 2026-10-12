# SnapSplit — Split Bills Smarter

A polished, offline-first bill splitter for dinners, trips, and shared tabs. Built as a complete mini app using: React, Vite, TypeScript, Tailwind CSS, and LocalStorage — no backend.

Fair to the last cent. Every personal share is computed in integer cents with Hamilton’s largest-remainder method, so rounded splits always add up to the grand total.

## Features

- **Bill creation** — name the restaurant or event, then add line items with price and quantity
- **Friends** — add or remove participants; duplicate names are rejected
- **Item assignment** — tag one or many people; shared dishes split equally
- **Tax and tip** — percent or fixed amount, allocated in proportion to what each person ordered
- **Live settlement** — items, tax, and tip per person, with a running grand total
- **Share** — copy a readable recap or open it in WhatsApp
- **Persistence** — the current bill restores after a browser refresh
- **Reset** — confirmed before anything is cleared
- **Validation** — no negative prices, invalid quantities, or lost cents

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS v4
- Lucide React icons
- LocalStorage only (no login, API, or database)

## Setup

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm test          # money math and settlement invariants
npm run build     # production bundle
npm run preview   # serve the production build
```

## How splitting works

Amounts are stored as **integer cents**. Shared items and proportional tax/tip use the largest-remainder method:

1. Give each person the floored share
2. Hand leftover cents to the largest remainders (stable index order on ties)

That is why three people sharing a $10.00 pizza see **$3.34 / $3.33 / $3.33**, not a penny left on the table.

Unassigned items stay out of personal totals until you tag someone. A warning on the settlement card keeps that visible.

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the project in [Vercel](https://vercel.com/new)
3. Framework preset: **Vite** (build `npm run build`, output `dist`)
4. Deploy — no environment variables required

Or from the CLI:

```bash
npx vercel
```

## Demo path

1. Click **Load sample bill** (or add your own friends and dishes)
2. Toggle who ate the salad — totals update immediately
3. Switch tax/tip between percent and a fixed amount
4. Refresh the page — the bill is still there
5. Copy the summary or share it on WhatsApp
6. Reset and confirm the dialog

## License

Apache License 2.0. See [LICENSE](LICENSE).
