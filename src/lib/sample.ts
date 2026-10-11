import type { Bill } from '../types'
import { createId, PERSON_COLORS } from './id'

export function sampleBill(): Bill {
  const ada = { id: createId(), name: 'Ada', color: PERSON_COLORS[0] ?? '#8b5cf6' }
  const ben = { id: createId(), name: 'Ben', color: PERSON_COLORS[1] ?? '#22d3ee' }
  const chen = { id: createId(), name: 'Chen', color: PERSON_COLORS[2] ?? '#f472b6' }

  return {
    version: 1,
    title: 'Coastal Kitchen',
    currency: 'USD',
    people: [ada, ben, chen],
    items: [
      {
        id: createId(),
        name: 'Grilled salmon',
        priceCents: 2800,
        quantity: 1,
        assignedTo: [ada.id],
      },
      {
        id: createId(),
        name: 'Truffle pasta',
        priceCents: 2200,
        quantity: 1,
        assignedTo: [ben.id],
      },
      {
        id: createId(),
        name: 'Caesar salad',
        priceCents: 1400,
        quantity: 1,
        assignedTo: [ada.id, ben.id, chen.id],
      },
      {
        id: createId(),
        name: 'Sparkling water',
        priceCents: 450,
        quantity: 2,
        assignedTo: [chen.id],
      },
      {
        id: createId(),
        name: 'Tiramisu',
        priceCents: 1200,
        quantity: 1,
        assignedTo: [ada.id, chen.id],
      },
    ],
    tax: { mode: 'percent', percentScaled: 8875, fixedCents: 0 },
    tip: { mode: 'percent', percentScaled: 18000, fixedCents: 0 },
    updatedAt: Date.now(),
  }
}
