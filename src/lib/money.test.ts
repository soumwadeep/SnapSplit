import { describe, expect, it } from 'vitest'
import { allocateByWeights, allocateEvenly, parseCents, percentOfCents } from './money'
import { sampleBill } from './sample'
import { calculateSettlement } from './split'

describe('parseCents', () => {
  it('parses dollars into integer cents', () => {
    expect(parseCents('12.34')).toBe(1234)
    expect(parseCents('12')).toBe(1200)
    expect(parseCents('0.01')).toBe(1)
    expect(parseCents('12.3')).toBe(1230)
  })

  it('rejects negatives and junk', () => {
    expect(parseCents('-1')).toBeNull()
    expect(parseCents('abc')).toBeNull()
    expect(parseCents('')).toBeNull()
  })

  it('rounds extra fractional digits half-up', () => {
    expect(parseCents('12.345')).toBe(1235)
    expect(parseCents('12.344')).toBe(1234)
  })
})

describe('allocateByWeights', () => {
  it('splits 100 cents three ways without losing a cent', () => {
    const parts = allocateEvenly(100, 3)
    expect(parts.reduce((a, b) => a + b, 0)).toBe(100)
    expect(parts.sort((a, b) => b - a)).toEqual([34, 33, 33])
  })

  it('handles $10.00 three ways as 334, 333, 333', () => {
    const parts = allocateEvenly(1000, 3)
    expect(parts.reduce((a, b) => a + b, 0)).toBe(1000)
    expect([...parts].sort((a, b) => b - a)).toEqual([334, 333, 333])
  })

  it('is deterministic on tied remainders', () => {
    expect(allocateEvenly(100, 3)).toEqual(allocateEvenly(100, 3))
  })

  it('returns zeros when all weights are zero', () => {
    expect(allocateByWeights(500, [0, 0, 0])).toEqual([0, 0, 0])
  })
})

describe('percentOfCents', () => {
  it('computes 8.875% of 8000 cents as integer cents', () => {
    // 80.00 * 8.875% = 7.10
    expect(percentOfCents(8000, 8875)).toBe(710)
  })
})

describe('calculateSettlement', () => {
  it('makes every personal share plus unassigned equal the grand total', () => {
    const bill = sampleBill()
    const settlement = calculateSettlement(bill)
    const people = settlement.shares.reduce((a, s) => a + s.totalCents, 0)
    const leftover =
      settlement.unassignedCents +
      settlement.unassignedTaxCents +
      settlement.unassignedTipCents
    expect(people + leftover).toBe(settlement.totalCents)
    expect(settlement.reconciles).toBe(true)
    expect(settlement.unassignedCents).toBe(0)
  })

  it('splits a shared item equally and still reconciles', () => {
    const bill = sampleBill()
    bill.items = [
      {
        id: '1',
        name: 'Pizza',
        priceCents: 1000,
        quantity: 1,
        assignedTo: bill.people.map((p) => p.id),
      },
    ]
    bill.tax = { mode: 'percent', percentScaled: 0, fixedCents: 0 }
    bill.tip = { mode: 'percent', percentScaled: 0, fixedCents: 0 }
    const settlement = calculateSettlement(bill)
    expect(settlement.shares.map((s) => s.itemsCents).sort((a, b) => b - a)).toEqual([
      334, 333, 333,
    ])
    expect(settlement.totalCents).toBe(1000)
    expect(settlement.shares.reduce((a, s) => a + s.totalCents, 0)).toBe(1000)
  })

  it('keeps unassigned cost out of personal totals', () => {
    const bill = sampleBill()
    bill.items = [
      {
        id: '1',
        name: 'Mystery',
        priceCents: 500,
        quantity: 1,
        assignedTo: [],
      },
    ]
    bill.tax = { mode: 'fixed', percentScaled: 0, fixedCents: 100 }
    bill.tip = { mode: 'fixed', percentScaled: 0, fixedCents: 0 }
    const settlement = calculateSettlement(bill)
    expect(settlement.shares.every((s) => s.totalCents === 0)).toBe(true)
    expect(settlement.unassignedCents).toBe(500)
    expect(settlement.unassignedTaxCents).toBe(100)
    expect(settlement.totalCents).toBe(600)
    expect(settlement.reconciles).toBe(true)
  })
})
