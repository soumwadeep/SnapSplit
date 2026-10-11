import { useState } from 'react'
import { formatPercent, parsePercentScaled } from '../lib/money'

type PercentFieldProps = {
  id: string
  label: string
  scaled: number
  onCommit: (scaled: number) => void
}

export function PercentField({ id, label, scaled, onCommit }: PercentFieldProps) {
  const [draft, setDraft] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const text = draft ?? formatPercent(scaled)

  function commit() {
    const parsed = parsePercentScaled(text === '' ? '0' : text)
    if (parsed === null) {
      setError('Enter a non-negative percent')
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
      <div className="relative">
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          className="field-input pr-8"
          value={text}
          aria-invalid={error ? true : undefined}
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
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-violet-200/50">
          %
        </span>
      </div>
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  )
}
