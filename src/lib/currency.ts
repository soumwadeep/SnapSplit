import type { CurrencyCode } from '../types'

export const CURRENCIES: {
  code: CurrencyCode
  label: string
  symbol: string
}[] = [
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'GBP', label: 'Pound', symbol: '£' },
  { code: 'INR', label: 'Indian Rupee', symbol: '₹' },
]

export function currencySymbol(code: CurrencyCode): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? '$'
}

export function formatMoney(cents: number, code: CurrencyCode): string {
  const symbol = currencySymbol(code)
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(cents)
  const whole = Math.trunc(abs / 100)
  const frac = String(abs % 100).padStart(2, '0')
  const grouped = whole.toLocaleString('en-US')
  return `${sign}${symbol}${grouped}.${frac}`
}
