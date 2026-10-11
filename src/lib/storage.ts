import type { Bill, Charge, CurrencyCode } from '../types'
import { createId, PERSON_COLORS } from './id'

const STORAGE_KEY = 'snapsplit:v1'

export function emptyCharge(): Charge {
  return { mode: 'percent', percentScaled: 0, fixedCents: 0 }
}

export function emptyBill(): Bill {
  return {
    version: 1,
    title: '',
    currency: 'USD',
    people: [],
    items: [],
    tax: emptyCharge(),
    tip: emptyCharge(),
    updatedAt: Date.now(),
  }
}

function isCurrency(value: unknown): value is CurrencyCode {
  return value === 'USD' || value === 'EUR' || value === 'GBP' || value === 'INR'
}

function isCharge(value: unknown): value is Charge {
  if (!value || typeof value !== 'object') return false
  const c = value as Charge
  return (
    (c.mode === 'percent' || c.mode === 'fixed') &&
    typeof c.percentScaled === 'number' &&
    Number.isFinite(c.percentScaled) &&
    c.percentScaled >= 0 &&
    typeof c.fixedCents === 'number' &&
    Number.isFinite(c.fixedCents) &&
    c.fixedCents >= 0
  )
}

export function sanitizeBill(raw: unknown): Bill | null {
  if (!raw || typeof raw !== 'object') return null
  const data = raw as Partial<Bill>
  if (data.version !== 1) return null
  if (typeof data.title !== 'string') return null
  if (!isCurrency(data.currency)) return null
  if (!Array.isArray(data.people) || !Array.isArray(data.items)) return null
  if (!isCharge(data.tax) || !isCharge(data.tip)) return null

  const people = data.people
    .filter(
      (p) =>
        p &&
        typeof p.id === 'string' &&
        typeof p.name === 'string' &&
        typeof p.color === 'string',
    )
    .map((p, i) => ({
      id: p.id,
      name: p.name.trim().slice(0, 40),
      color: p.color || PERSON_COLORS[i % PERSON_COLORS.length] || '#8b5cf6',
    }))

  const personIds = new Set(people.map((p) => p.id))

  const items = data.items
    .filter(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        typeof item.priceCents === 'number' &&
        Number.isFinite(item.priceCents) &&
        typeof item.quantity === 'number' &&
        Number.isInteger(item.quantity),
    )
    .map((item) => ({
      id: item.id || createId(),
      name: item.name.trim().slice(0, 80),
      priceCents: Math.max(0, Math.round(item.priceCents)),
      quantity: Math.min(9999, Math.max(1, item.quantity)),
      assignedTo: Array.isArray(item.assignedTo)
        ? [...new Set(item.assignedTo.filter((id) => typeof id === 'string' && personIds.has(id)))]
        : [],
    }))

  return {
    version: 1,
    title: data.title.trim().slice(0, 80),
    currency: data.currency,
    people,
    items,
    tax: data.tax,
    tip: data.tip,
    updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
  }
}

export function loadBill(): Bill | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return sanitizeBill(JSON.parse(raw))
  } catch {
    return null
  }
}

export function saveBill(bill: Bill): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bill))
  } catch {
    // Quota or private mode — the in-memory bill still works for this session.
  }
}

export function clearBillStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
