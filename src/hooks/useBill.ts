import { useCallback, useEffect, useMemo, useState } from 'react'
import { createId, nextPersonColor } from '../lib/id'
import { sampleBill } from '../lib/sample'
import { calculateSettlement } from '../lib/split'
import { clearBillStorage, emptyBill, loadBill, saveBill } from '../lib/storage'
import type { Bill, BillItem, ChargeMode, CurrencyCode, Person } from '../types'

function touch(bill: Bill, patch: Partial<Bill>): Bill {
  return { ...bill, ...patch, updatedAt: Date.now() }
}

export function useBill() {
  const [bill, setBill] = useState<Bill>(() => loadBill() ?? emptyBill())

  useEffect(() => {
    saveBill(bill)
  }, [bill])

  const settlement = useMemo(() => calculateSettlement(bill), [bill])

  const setTitle = useCallback((title: string) => {
    setBill((prev) => touch(prev, { title: title.slice(0, 80) }))
  }, [])

  const setCurrency = useCallback((currency: CurrencyCode) => {
    setBill((prev) => touch(prev, { currency }))
  }, [])

  const addPerson = useCallback((rawName: string): string | null => {
    const name = rawName.trim().slice(0, 40)
    if (!name) return 'Enter a name.'
    let error: string | null = null
    setBill((prev) => {
      const exists = prev.people.some(
        (p) => p.name.toLowerCase() === name.toLowerCase(),
      )
      if (exists) {
        error = 'That name is already on this bill.'
        return prev
      }
      const person: Person = {
        id: createId(),
        name,
        color: nextPersonColor(prev.people.map((p) => p.color)),
      }
      return touch(prev, { people: [...prev.people, person] })
    })
    return error
  }, [])

  const removePerson = useCallback((id: string) => {
    setBill((prev) =>
      touch(prev, {
        people: prev.people.filter((p) => p.id !== id),
        items: prev.items.map((item) => ({
          ...item,
          assignedTo: item.assignedTo.filter((pid) => pid !== id),
        })),
      }),
    )
  }, [])

  const addItem = useCallback(
    (input: { name: string; priceCents: number; quantity: number }): string | null => {
      const name = input.name.trim().slice(0, 80)
      if (!name) return 'Give this item a name.'
      if (input.priceCents < 0) return 'Price cannot be negative.'
      if (!Number.isInteger(input.quantity) || input.quantity < 1) {
        return 'Quantity must be a whole number of at least 1.'
      }
      const item: BillItem = {
        id: createId(),
        name,
        priceCents: input.priceCents,
        quantity: input.quantity,
        assignedTo: [],
      }
      setBill((prev) => touch(prev, { items: [...prev.items, item] }))
      return null
    },
    [],
  )

  const updateItem = useCallback((id: string, patch: Partial<BillItem>): string | null => {
    if (patch.priceCents !== undefined && patch.priceCents < 0) {
      return 'Price cannot be negative.'
    }
    if (
      patch.quantity !== undefined &&
      (!Number.isInteger(patch.quantity) || patch.quantity < 1)
    ) {
      return 'Quantity must be a whole number of at least 1.'
    }
    if (patch.name !== undefined && patch.name.length > 80) {
      return 'Keep item names under 80 characters.'
    }
    setBill((prev) =>
      touch(prev, {
        items: prev.items.map((item) => {
          if (item.id !== id) return item
          const next = { ...item, ...patch }
          if (patch.name !== undefined) next.name = patch.name.slice(0, 80)
          if (patch.assignedTo) {
            next.assignedTo = [...new Set(patch.assignedTo)]
          }
          return next
        }),
      }),
    )
    return null
  }, [])

  const toggleAssignment = useCallback((itemId: string, personId: string) => {
    setBill((prev) =>
      touch(prev, {
        items: prev.items.map((item) => {
          if (item.id !== itemId) return item
          const has = item.assignedTo.includes(personId)
          return {
            ...item,
            assignedTo: has
              ? item.assignedTo.filter((id) => id !== personId)
              : [...item.assignedTo, personId],
          }
        }),
      }),
    )
  }, [])

  const assignAll = useCallback((itemId: string) => {
    setBill((prev) =>
      touch(prev, {
        items: prev.items.map((item) =>
          item.id === itemId
            ? { ...item, assignedTo: prev.people.map((p) => p.id) }
            : item,
        ),
      }),
    )
  }, [])

  const removeItem = useCallback((id: string) => {
    setBill((prev) =>
      touch(prev, { items: prev.items.filter((item) => item.id !== id) }),
    )
  }, [])

  const setCharge = useCallback(
    (
      kind: 'tax' | 'tip',
      patch: { mode?: ChargeMode; percentScaled?: number; fixedCents?: number },
    ) => {
      setBill((prev) => {
        const current = prev[kind]
        return touch(prev, {
          [kind]: {
            mode: patch.mode ?? current.mode,
            percentScaled: Math.min(
              1_000_000,
              Math.max(0, patch.percentScaled ?? current.percentScaled),
            ),
            fixedCents: Math.max(0, patch.fixedCents ?? current.fixedCents),
          },
        })
      })
    },
    [],
  )

  const resetBill = useCallback(() => {
    clearBillStorage()
    setBill(emptyBill())
  }, [])

  const loadSample = useCallback(() => {
    setBill(sampleBill())
  }, [])

  return {
    bill,
    settlement,
    setTitle,
    setCurrency,
    addPerson,
    removePerson,
    addItem,
    updateItem,
    toggleAssignment,
    assignAll,
    removeItem,
    setCharge,
    resetBill,
    loadSample,
  }
}
