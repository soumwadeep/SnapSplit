export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

export const PERSON_COLORS = [
  '#8b5cf6',
  '#22d3ee',
  '#f472b6',
  '#34d399',
  '#fbbf24',
  '#fb7185',
  '#60a5fa',
  '#c084fc',
  '#2dd4bf',
  '#f97316',
]

export function nextPersonColor(used: readonly string[]): string {
  const taken = new Set(used)
  const fresh = PERSON_COLORS.find((c) => !taken.has(c))
  if (fresh) return fresh
  return PERSON_COLORS[used.length % PERSON_COLORS.length] ?? '#8b5cf6'
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return (parts[0] ?? '?').slice(0, 2).toUpperCase()
  const first = parts[0]?.[0] ?? ''
  const last = parts[parts.length - 1]?.[0] ?? ''
  return `${first}${last}`.toUpperCase()
}
