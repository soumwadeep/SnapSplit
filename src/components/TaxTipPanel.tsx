import { formatMoney } from '../lib/currency'
import type { Charge, ChargeMode, CurrencyCode } from '../types'
import { MoneyField } from './MoneyField'
import { PercentField } from './PercentField'

type TaxTipPanelProps = {
  tax: Charge
  tip: Charge
  currency: CurrencyCode
  taxCents: number
  tipCents: number
  onChange: (
    kind: 'tax' | 'tip',
    patch: { mode?: ChargeMode; percentScaled?: number; fixedCents?: number },
  ) => void
}

export function TaxTipPanel({
  tax,
  tip,
  currency,
  taxCents,
  tipCents,
  onChange,
}: TaxTipPanelProps) {
  return (
    <section className="card">
      <h2 className="card-title">Tax & tip</h2>
      <p className="card-subtitle">
        Percent or a fixed amount. Both are shared in proportion to what each person ordered.
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <ChargeCard
          kind="tax"
          title="Tax"
          charge={tax}
          currency={currency}
          resolved={taxCents}
          onChange={onChange}
        />
        <ChargeCard
          kind="tip"
          title="Tip"
          charge={tip}
          currency={currency}
          resolved={tipCents}
          onChange={onChange}
        />
      </div>
    </section>
  )
}

function ChargeCard({
  kind,
  title,
  charge,
  currency,
  resolved,
  onChange,
}: {
  kind: 'tax' | 'tip'
  title: string
  charge: Charge
  currency: CurrencyCode
  resolved: number
  onChange: TaxTipPanelProps['onChange']
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <div className="flex rounded-full bg-white/5 p-0.5" role="group" aria-label={`${title} mode`}>
          {(['percent', 'fixed'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={charge.mode === mode}
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                charge.mode === mode
                  ? 'bg-violet-500 text-white shadow-glow'
                  : 'text-violet-100/60 hover:text-white'
              }`}
              onClick={() => onChange(kind, { mode })}
            >
              {mode === 'percent' ? '%' : 'Fixed'}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3">
        {charge.mode === 'percent' ? (
          <PercentField
            id={`${kind}-percent`}
            label={`${title} percent`}
            scaled={charge.percentScaled}
            onCommit={(percentScaled) => onChange(kind, { percentScaled })}
          />
        ) : (
          <MoneyField
            id={`${kind}-fixed`}
            label={`${title} amount`}
            cents={charge.fixedCents}
            onCommit={(fixedCents) => onChange(kind, { fixedCents })}
          />
        )}
      </div>
      <p className="mt-3 text-right text-sm tabular-nums text-cyan-200">
        Adds {formatMoney(resolved, currency)}
      </p>
    </div>
  )
}
