const CENTS_DECIMALS = 2
const PERCENT_DECIMALS = 3
export const CENTS_SCALE = 100
export const PERCENT_SCALE = 1000

const MAX_WHOLE_DIGITS = 9

export function parseScaled(input: string, decimals: number): number | null {
  const trimmed = input.trim()
  if (trimmed === '' || trimmed === '.') return null
  if (!/^\d*\.?\d+$/.test(trimmed)) return null

  const [wholeRaw, fracRaw = ''] = trimmed.split('.')
  const whole = wholeRaw === '' ? '0' : wholeRaw
  if (whole.length > MAX_WHOLE_DIGITS) return null

  const wholeValue = Number(whole)
  if (!Number.isSafeInteger(wholeValue)) return null

  const scale = 10 ** decimals
  let n = wholeValue * scale

  if (fracRaw.length <= decimals) {
    const frac = fracRaw.padEnd(decimals, '0')
    n += frac ? Number(frac) : 0
    return Number.isSafeInteger(n) ? n : null
  }

  const kept = fracRaw.slice(0, decimals)
  const rest = fracRaw.slice(decimals)
  n += Number(kept)
  if (rest[0] !== undefined && Number(rest[0]) >= 5) n += 1
  return Number.isSafeInteger(n) ? n : null
}

export function parseCents(input: string): number | null {
  const value = parseScaled(input, CENTS_DECIMALS)
  if (value === null) return null
  return value
}

export function parsePercentScaled(input: string): number | null {
  const value = parseScaled(input, PERCENT_DECIMALS)
  if (value === null) return null
  return value
}

export function parseQuantity(input: string): number | null {
  const trimmed = input.trim()
  if (!/^[1-9]\d*$/.test(trimmed)) return null
  const n = Number(trimmed)
  if (!Number.isSafeInteger(n) || n < 1 || n > 9999) return null
  return n
}

export function formatScaled(value: number, decimals: number): string {
  const sign = value < 0 ? '-' : ''
  const abs = Math.abs(value)
  const scale = 10 ** decimals
  const whole = Math.trunc(abs / scale)
  const frac = String(abs % scale).padStart(decimals, '0')
  return `${sign}${whole}.${frac}`
}

export function formatCentsPlain(cents: number): string {
  return formatScaled(cents, CENTS_DECIMALS)
}

export function formatPercent(percentScaled: number): string {
  const raw = formatScaled(percentScaled, PERCENT_DECIMALS)
  return raw.replace(/\.?0+$/, '') || '0'
}

export function roundHalfUpDiv(numerator: number, denominator: number): number {
  if (denominator <= 0) throw new Error('Denominator must be positive')
  const q = Math.trunc(numerator / denominator)
  const rem = numerator % denominator
  if (Math.abs(rem) * 2 >= denominator) {
    return q + (numerator < 0 ? -1 : 1)
  }
  return q
}

/** Apply a percent (3 decimal places) to an integer cent amount. */
export function percentOfCents(cents: number, percentScaled: number): number {
  if (cents === 0 || percentScaled === 0) return 0
  return roundHalfUpDiv(cents * percentScaled, PERCENT_SCALE * 100)
}

/**
 * Hamilton / largest-remainder allocation.
 * Parts are integers that sum exactly to `total`.
 */
export function allocateByWeights(
  total: number,
  weights: readonly number[],
): number[] {
  const n = weights.length
  if (n === 0) return []
  if (total === 0) return Array.from({ length: n }, () => 0)

  const sumW = weights.reduce((acc, w) => acc + w, 0)
  if (sumW === 0) return Array.from({ length: n }, () => 0)

  const result = new Array<number>(n)
  const remainders: { index: number; rem: number }[] = []
  let allocated = 0

  for (let i = 0; i < n; i += 1) {
    const weight = weights[i] ?? 0
    const prod = total * weight
    const q = Math.trunc(prod / sumW)
    result[i] = q
    allocated += q
    remainders.push({ index: i, rem: prod - q * sumW })
  }

  let leftover = total - allocated
  remainders.sort((a, b) => b.rem - a.rem || a.index - b.index)
  for (let k = 0; leftover > 0 && k < remainders.length; k += 1) {
    const slot = remainders[k]
    if (!slot) continue
    result[slot.index] += 1
    leftover -= 1
  }

  return result
}

export function allocateEvenly(total: number, count: number): number[] {
  if (count <= 0) return []
  return allocateByWeights(
    total,
    Array.from({ length: count }, () => 1),
  )
}

export function uniqueIds(ids: readonly string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const id of ids) {
    if (seen.has(id)) continue
    seen.add(id)
    out.push(id)
  }
  return out
}
