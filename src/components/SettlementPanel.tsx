import { BadgeCheck, TriangleAlert } from 'lucide-react'
import { formatMoney } from '../lib/currency'
import { initials } from '../lib/id'
import type { CurrencyCode, Settlement } from '../types'

type SettlementPanelProps = {
  settlement: Settlement
  currency: CurrencyCode
}

export function SettlementPanel({ settlement, currency }: SettlementPanelProps) {
  const leftover =
    settlement.unassignedCents +
    settlement.unassignedTaxCents +
    settlement.unassignedTipCents

  return (
    <aside className="card lg:sticky lg:top-6">
      <h2 className="card-title">Settlement</h2>
      <p className="card-subtitle">Live totals. Every personal share plus leftovers equals the bill.</p>

      <dl className="mt-5 space-y-2 text-sm">
        <Row label="Subtotal" value={formatMoney(settlement.subtotalCents, currency)} />
        <Row label="Tax" value={formatMoney(settlement.taxCents, currency)} />
        <Row label="Tip" value={formatMoney(settlement.tipCents, currency)} />
        <div className="flex items-center justify-between border-t border-white/10 pt-3">
          <dt className="text-sm font-semibold text-violet-100/80">Grand total</dt>
          <dd className="font-display text-3xl tabular-nums text-white">
            {formatMoney(settlement.totalCents, currency)}
          </dd>
        </div>
      </dl>

      <div
        className={`mt-4 flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs ${
          settlement.reconciles
            ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
            : 'border-rose-400/20 bg-rose-400/10 text-rose-200'
        }`}
      >
        {settlement.reconciles ? (
          <BadgeCheck className="size-4 shrink-0" aria-hidden />
        ) : (
          <TriangleAlert className="size-4 shrink-0" aria-hidden />
        )}
        {settlement.reconciles
          ? 'Shares add up to the total — fair to the last cent.'
          : 'Totals do not reconcile.'}
      </div>

      {settlement.warnings.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {settlement.warnings.map((warning) => (
            <li key={warning} className="flex gap-2 text-xs text-amber-200/90">
              <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              {warning}
            </li>
          ))}
        </ul>
      ) : null}

      {settlement.shares.length === 0 ? (
        <div className="empty-block mt-5">Add friends to see who owes what.</div>
      ) : (
        <ul className="mt-5 space-y-3">
          {settlement.shares.map((share) => (
            <li
              key={share.personId}
              className="rounded-2xl border border-white/8 bg-gradient-to-br from-white/[0.05] to-transparent p-4"
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex size-10 items-center justify-center rounded-2xl text-sm font-bold text-[#0b0914]"
                  style={{ background: share.color }}
                >
                  {initials(share.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{share.name} owes</p>
                  <p className="text-xs text-violet-100/55">
                    items {formatMoney(share.itemsCents, currency)} · tax{' '}
                    {formatMoney(share.taxCents, currency)} · tip{' '}
                    {formatMoney(share.tipCents, currency)}
                  </p>
                </div>
                <p className="font-display text-2xl tabular-nums text-cyan-200">
                  {formatMoney(share.totalCents, currency)}
                </p>
              </div>
              {share.lines.length > 0 ? (
                <ul className="mt-3 space-y-1 border-t border-white/8 pt-3 text-xs text-violet-100/60">
                  {share.lines.map((line) => (
                    <li key={line.itemId} className="flex justify-between gap-3">
                      <span>
                        {line.name}
                        {line.sharedWith > 1 ? ` · split ${line.sharedWith} ways` : ''}
                      </span>
                      <span className="tabular-nums text-violet-100/80">
                        {formatMoney(line.cents, currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-xs text-violet-100/40">No items assigned yet.</p>
              )}
            </li>
          ))}
        </ul>
      )}

      {leftover > 0 ? (
        <div className="mt-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-3 text-sm text-amber-100">
          Unassigned {formatMoney(leftover, currency)} still sits on the table — tag those items to
          fold it into personal totals.
        </div>
      ) : null}
    </aside>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-violet-100/55">{label}</dt>
      <dd className="tabular-nums text-white">{value}</dd>
    </div>
  )
}
