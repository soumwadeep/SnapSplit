export type ChargeMode = 'percent' | 'fixed'

export type Charge = {
  mode: ChargeMode
  /** Percent with 3 decimal places, e.g. 8.25% → 8250 */
  percentScaled: number
  fixedCents: number
}

export type Person = {
  id: string
  name: string
  color: string
}

export type BillItem = {
  id: string
  name: string
  priceCents: number
  quantity: number
  assignedTo: string[]
}

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR'

export type Bill = {
  version: 1
  title: string
  currency: CurrencyCode
  people: Person[]
  items: BillItem[]
  tax: Charge
  tip: Charge
  updatedAt: number
}

export type ItemLineShare = {
  itemId: string
  name: string
  cents: number
  sharedWith: number
}

export type PersonShare = {
  personId: string
  name: string
  color: string
  itemsCents: number
  taxCents: number
  tipCents: number
  totalCents: number
  lines: ItemLineShare[]
}

export type Settlement = {
  subtotalCents: number
  taxCents: number
  tipCents: number
  totalCents: number
  unassignedCents: number
  unassignedTaxCents: number
  unassignedTipCents: number
  shares: PersonShare[]
  warnings: string[]
  reconciles: boolean
}
