import { CURRENCIES } from '../lib/currency'
import type { CurrencyCode } from '../types'

type BillDetailsProps = {
  title: string
  currency: CurrencyCode
  onTitle: (value: string) => void
  onCurrency: (value: CurrencyCode) => void
}

export function BillDetails({ title, currency, onTitle, onCurrency }: BillDetailsProps) {
  return (
    <section className="card">
      <h2 className="card-title">Bill</h2>
      <p className="card-subtitle">Restaurant, trip, or night out.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_10rem]">
        <label className="field" htmlFor="bill-title">
          <span className="field-label">Name</span>
          <input
            id="bill-title"
            className="field-input"
            placeholder="Coastal Kitchen"
            maxLength={80}
            value={title}
            onChange={(e) => onTitle(e.target.value)}
          />
        </label>
        <label className="field" htmlFor="bill-currency">
          <span className="field-label">Currency</span>
          <select
            id="bill-currency"
            className="field-input"
            value={currency}
            onChange={(e) => onCurrency(e.target.value as CurrencyCode)}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.symbol} {c.code}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  )
}
