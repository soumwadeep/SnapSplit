import type { Bill, Settlement } from '../types'
import { formatMoney } from './currency'
import { formatPercent } from './money'

function chargeLabel(
  bill: Bill,
  kind: 'tax' | 'tip',
  amount: number,
): string {
  const charge = kind === 'tax' ? bill.tax : bill.tip
  const money = formatMoney(amount, bill.currency)
  if (charge.mode === 'percent') {
    return `${formatPercent(charge.percentScaled)}%  ${money}`
  }
  return money
}

export function buildShareText(bill: Bill, settlement: Settlement): string {
  const title = bill.title.trim() || 'Untitled bill'
  const lines: string[] = [
    `SnapSplit — ${title}`,
    'Split bills smarter',
    '────────────────────────',
  ]

  if (bill.items.length === 0) {
    lines.push('No items yet.')
  } else {
    for (const item of bill.items) {
      const names = item.assignedTo
        .map((id) => bill.people.find((p) => p.id === id)?.name)
        .filter((n): n is string => Boolean(n))
      const who = names.length ? names.join(', ') : 'unassigned'
      const qty = item.quantity > 1 ? ` ×${item.quantity}` : ''
      const line = item.priceCents * item.quantity
      lines.push(
        `${item.name || 'Untitled'}${qty}  ${formatMoney(line, bill.currency)}  (${who})`,
      )
    }
  }

  lines.push('────────────────────────')
  lines.push(`Subtotal     ${formatMoney(settlement.subtotalCents, bill.currency)}`)
  lines.push(`Tax ${chargeLabel(bill, 'tax', settlement.taxCents)}`)
  lines.push(`Tip ${chargeLabel(bill, 'tip', settlement.tipCents)}`)
  lines.push(`Total        ${formatMoney(settlement.totalCents, bill.currency)}`)
  lines.push('')
  lines.push('Who owes what')

  if (settlement.shares.length === 0) {
    lines.push('Add friends to split this bill.')
  } else {
    for (const share of settlement.shares) {
      lines.push(
        `${share.name}: ${formatMoney(share.totalCents, bill.currency)}  (items ${formatMoney(share.itemsCents, bill.currency)} · tax ${formatMoney(share.taxCents, bill.currency)} · tip ${formatMoney(share.tipCents, bill.currency)})`,
      )
    }
  }

  const leftover =
    settlement.unassignedCents +
    settlement.unassignedTaxCents +
    settlement.unassignedTipCents
  if (leftover > 0) {
    lines.push(
      `Unassigned: ${formatMoney(leftover, bill.currency)}  (assign items to include this in personal totals)`,
    )
  }

  lines.push('')
  lines.push('Fair to the last cent — via SnapSplit')
  return lines.join('\n')
}

export function whatsappShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}
