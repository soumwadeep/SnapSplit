import { UserPlus, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { initials } from '../lib/id'
import type { Person } from '../types'

type FriendsPanelProps = {
  people: Person[]
  onAdd: (name: string) => string | null
  onRemove: (id: string) => void
}

export function FriendsPanel({ people, onAdd, onRemove }: FriendsPanelProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  function submit(event: FormEvent) {
    event.preventDefault()
    const result = onAdd(name)
    if (result) {
      setError(result)
      return
    }
    setName('')
    setError(null)
  }

  return (
    <section className="card">
      <h2 className="card-title">Friends</h2>
      <p className="card-subtitle">Everyone at the table. Tap a chip on an item to assign it.</p>

      <form className="mt-5 flex gap-2" onSubmit={submit}>
        <label className="sr-only" htmlFor="friend-name">
          Friend name
        </label>
        <input
          id="friend-name"
          className="field-input flex-1"
          placeholder="Add a name"
          maxLength={40}
          value={name}
          aria-invalid={error ? true : undefined}
          onChange={(e) => {
            setName(e.target.value)
            setError(null)
          }}
        />
        <button type="submit" className="btn-primary shrink-0">
          <UserPlus className="size-4" aria-hidden />
          Add
        </button>
      </form>
      {error ? <p className="field-error mt-2">{error}</p> : null}

      {people.length === 0 ? (
        <div className="empty-block mt-5">
          Add at least two friends to split shared plates.
        </div>
      ) : (
        <ul className="mt-5 flex flex-wrap gap-2">
          {people.map((person) => (
            <li
              key={person.id}
              className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1 pr-1.5"
            >
              <span
                className="flex size-8 items-center justify-center rounded-full text-xs font-bold text-[#0b0914]"
                style={{ background: person.color }}
                aria-hidden
              >
                {initials(person.name)}
              </span>
              <span className="pr-1 text-sm font-medium text-white">{person.name}</span>
              <button
                type="button"
                className="rounded-full p-1.5 text-violet-200/50 transition hover:bg-white/10 hover:text-white"
                aria-label={`Remove ${person.name}`}
                onClick={() => onRemove(person.id)}
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
