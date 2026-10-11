import { Minus, Plus, Trash2, Users } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { formatMoney } from '../lib/currency'
import { parseCents, parseQuantity } from '../lib/money'
import type { BillItem, CurrencyCode, Person } from '../types'

type ItemsPanelProps = {
  items: BillItem[]
  people: Person[]
  currency: CurrencyCode
  onAdd: (input: { name: string; priceCents: number; quantity: number }) => string | null
  onUpdate: (id: string, patch: Partial<BillItem>) => string | null
  onRemove: (id: string) => void
  onToggle: (itemId: string, personId: string) => void
  onAssignAll: (itemId: string) => void
}

export function ItemsPanel({
  items,
  people,
  currency,
  onAdd,
  onUpdate,
  onRemove,
  onToggle,
  onAssignAll,
}: ItemsPanelProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [qty, setQty] = useState('1')
  const [error, setError] = useState<string | null>(null)

  function submit(event: FormEvent) {
    event.preventDefault()
    const priceCents = parseCents(price)
    const quantity = parseQuantity(qty)
    if (priceCents === null) {
      setError('Enter a valid price (no negatives).')
      return
    }
    if (quantity === null) {
      setError('Quantity must be a whole number of at least 1.')
      return
    }
    const result = onAdd({ name, priceCents, quantity })
    if (result) {
      setError(result)
      return
    }
    setName('')
    setPrice('')
    setQty('1')
    setError(null)
  }

  return (
    <section className="card">
      <h2 className="card-title">Items</h2>
      <p className="card-subtitle">
        Line items from the receipt. Shared dishes split equally among whoever is tagged.
      </p>

      <form
        className="mt-5 grid gap-2 sm:grid-cols-[1fr_7rem_5.5rem_auto]"
        onSubmit={submit}
      >
        <label className="sr-only" htmlFor="item-name">
          Item name
        </label>
        <input
          id="item-name"
          className="field-input"
          placeholder="Truffle pasta"
          maxLength={80}
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setError(null)
          }}
        />
        <label className="sr-only" htmlFor="item-price">
          Price
        </label>
        <input
          id="item-price"
          className="field-input"
          inputMode="decimal"
          placeholder="18.00"
          value={price}
          onChange={(e) => {
            setPrice(e.target.value)
            setError(null)
          }}
        />
        <label className="sr-only" htmlFor="item-qty">
          Quantity
        </label>
        <input
          id="item-qty"
          className="field-input"
          inputMode="numeric"
          value={qty}
          onChange={(e) => {
            setQty(e.target.value)
            setError(null)
          }}
        />
        <button type="submit" className="btn-primary">
          <Plus className="size-4" aria-hidden />
          Add item
        </button>
      </form>
      {error ? <p className="field-error mt-2">{error}</p> : null}

      {items.length === 0 ? (
        <div className="empty-block mt-5">
          No dishes yet. Add the first line from the receipt to see live shares.
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              people={people}
              currency={currency}
              onUpdate={onUpdate}
              onRemove={onRemove}
              onToggle={onToggle}
              onAssignAll={onAssignAll}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

function ItemRow({
  item,
  people,
  currency,
  onUpdate,
  onRemove,
  onToggle,
  onAssignAll,
}: {
  item: BillItem
  people: Person[]
  currency: CurrencyCode
  onUpdate: (id: string, patch: Partial<BillItem>) => string | null
  onRemove: (id: string) => void
  onToggle: (itemId: string, personId: string) => void
  onAssignAll: (itemId: string) => void
}) {
  const line = item.priceCents * item.quantity
  const unassigned = item.assignedTo.length === 0

  return (
    <li className="rounded-2xl border border-white/8 bg-black/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <input
            className="w-full bg-transparent text-base font-semibold text-white outline-none placeholder:text-white/30"
            defaultValue={item.name}
            key={`${item.id}-${item.name}`}
            aria-label="Item name"
            onBlur={(e) => {
              const next = e.target.value.trim()
              if (!next) {
                e.target.value = item.name
                return
              }
              onUpdate(item.id, { name: next })
            }}
          />
          <div className="flex flex-wrap items-center gap-3 text-sm text-violet-100/70">
            <label className="flex items-center gap-1.5">
              <span className="text-violet-200/40">Price</span>
              <input
                className="w-24 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white outline-none focus:border-cyan-400/60"
                inputMode="decimal"
                defaultValue={(item.priceCents / 100).toFixed(2)}
                key={item.priceCents}
                aria-label={`${item.name} price`}
                onBlur={(e) => {
                  const parsed = parseCents(e.target.value)
                  if (parsed === null) {
                    e.target.value = (item.priceCents / 100).toFixed(2)
                    return
                  }
                  onUpdate(item.id, { priceCents: parsed })
                }}
              />
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="icon-btn"
                aria-label="Decrease quantity"
                onClick={() => onUpdate(item.id, { quantity: Math.max(1, item.quantity - 1) })}
              >
                <Minus className="size-3.5" />
              </button>
              <span className="w-8 text-center font-semibold text-white" aria-label="Quantity">
                {item.quantity}
              </span>
              <button
                type="button"
                className="icon-btn"
                aria-label="Increase quantity"
                onClick={() => onUpdate(item.id, { quantity: item.quantity + 1 })}
              >
                <Plus className="size-3.5" />
              </button>
            </div>
            <span className="ml-auto font-semibold tabular-nums text-cyan-200">
              {formatMoney(line, currency)}
            </span>
          </div>
        </div>
        <button
          type="button"
          className="icon-btn self-end text-rose-300/70 hover:text-rose-200 sm:self-start"
          aria-label={`Delete ${item.name}`}
          onClick={() => onRemove(item.id)}
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {people.length === 0 ? (
          <p className="text-xs text-amber-200/80">Add friends before assigning this item.</p>
        ) : (
          <>
            {people.map((person) => {
              const active = item.assignedTo.includes(person.id)
              return (
                <button
                  key={person.id}
                  type="button"
                  aria-pressed={active}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    active
                      ? 'border-transparent text-[#0b0914]'
                      : 'border-white/10 bg-white/5 text-violet-100/70 hover:border-white/20'
                  }`}
                  style={active ? { background: person.color } : undefined}
                  onClick={() => onToggle(item.id, person.id)}
                >
                  {person.name}
                </button>
              )
            })}
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200 hover:bg-cyan-400/20"
              onClick={() => onAssignAll(item.id)}
            >
              <Users className="size-3" aria-hidden />
              Split all
            </button>
          </>
        )}
      </div>
      {unassigned && line > 0 ? (
        <p className="mt-2 text-xs text-amber-300/90">Unassigned — this line is not in anyone’s total yet.</p>
      ) : null}
    </li>
  )
}
