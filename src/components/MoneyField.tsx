import { useState } from 'react'
import { formatCentsPlain, parseCents } from '../lib/money'

type MoneyFieldProps = {
  id: string
  label: string
  cents: number
  onCommit: (cents: number) => void
  hint?: string
}

export function MoneyField({ id, label, cents, onCommit, hint }: MoneyFieldProps) {
  const [draft, setDraft] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const text = draft ?? formatCentsPlain(cents)

  function commit() {
    const parsed = parseCents(text)
    if (parsed === null) {
      setError('Enter a valid amount like 12.50')
      setDraft(null)
      return
    }
    setError(null)
    setDraft(null)
    onCommit(parsed)
  }

  return (
    <label className="field" htmlFor={id}>
      <span className="field-label">{label}</span>
      <input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        className="field-input"
        value={text}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        onChange={(e) => {
          setDraft(e.target.value)
          setError(null)
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            ;(e.target as HTMLInputElement).blur()
          }
        }}
      />
      {error ? (
        <span id={`${id}-err`} className="field-error">
          {error}
        </span>
      ) : hint ? (
        <span id={`${id}-hint`} className="field-hint">
          {hint}
        </span>
      ) : null}
    </label>
  )
}
