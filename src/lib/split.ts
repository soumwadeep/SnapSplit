import type { Bill, Charge, PersonShare, Settlement } from '../types'
import { allocateByWeights, allocateEvenly, percentOfCents, uniqueIds } from './money'

export function resolveCharge(charge: Charge, baseCents: number): number {
  if (charge.mode === 'fixed') return Math.max(0, charge.fixedCents)
  return Math.max(0, percentOfCents(baseCents, charge.percentScaled))
}

export function calculateSettlement(bill: Bill): Settlement {
  const peopleById = new Map(bill.people.map((p) => [p.id, p]))
  const warnings: string[] = []

  const shares: PersonShare[] = bill.people.map((person) => ({
    personId: person.id,
    name: person.name,
    color: person.color,
    itemsCents: 0,
    taxCents: 0,
    tipCents: 0,
    totalCents: 0,
    lines: [],
  }))
  const shareIndex = new Map(shares.map((s, i) => [s.personId, i]))

  let assignedSubtotal = 0
  let unassignedCents = 0

  for (const item of bill.items) {
    const lineTotal = item.priceCents * item.quantity
    if (item.priceCents < 0 || item.quantity < 1) {
      warnings.push(`“${item.name || 'Untitled item'}” has an invalid price or quantity.`)
      continue
    }

    const assignees = uniqueIds(item.assignedTo).filter((id) => peopleById.has(id))
    if (assignees.length !== uniqueIds(item.assignedTo).length) {
      warnings.push(`“${item.name || 'Untitled item'}” had invalid assignments that were ignored.`)
    }

    if (assignees.length === 0) {
      unassignedCents += lineTotal
      if (lineTotal > 0) {
        warnings.push(
          `“${item.name || 'Untitled item'}” is not assigned. Its cost is excluded from personal totals.`,
        )
      }
      continue
    }

    const parts = allocateEvenly(lineTotal, assignees.length)
    assignees.forEach((id, i) => {
      const index = shareIndex.get(id)
      const share = index === undefined ? undefined : shares[index]
      const cents = parts[i] ?? 0
      if (!share) return
      share.itemsCents += cents
      share.lines.push({
        itemId: item.id,
        name: item.name || 'Untitled item',
        cents,
        sharedWith: assignees.length,
      })
    })
    assignedSubtotal += lineTotal
  }

  const subtotalCents = assignedSubtotal + unassignedCents
  const taxCents = resolveCharge(bill.tax, subtotalCents)
  const tipCents = resolveCharge(bill.tip, subtotalCents)
  const totalCents = subtotalCents + taxCents + tipCents

  const weights = [...shares.map((s) => s.itemsCents), unassignedCents]
  const taxParts = allocateByWeights(taxCents, weights)
  const tipParts = allocateByWeights(tipCents, weights)

  shares.forEach((share, i) => {
    share.taxCents = taxParts[i] ?? 0
    share.tipCents = tipParts[i] ?? 0
    share.totalCents = share.itemsCents + share.taxCents + share.tipCents
  })

  const unassignedTaxCents = taxParts[shares.length] ?? 0
  const unassignedTipCents = tipParts[shares.length] ?? 0

  const peopleSum = shares.reduce((acc, s) => acc + s.totalCents, 0)
  const unassignedTotal = unassignedCents + unassignedTaxCents + unassignedTipCents
  const reconciles = peopleSum + unassignedTotal === totalCents

  if (!reconciles) {
    warnings.push('Internal totals did not reconcile. Please reset and try again.')
  }

  return {
    subtotalCents,
    taxCents,
    tipCents,
    totalCents,
    unassignedCents,
    unassignedTaxCents,
    unassignedTipCents,
    shares,
    warnings,
    reconciles,
  }
}
