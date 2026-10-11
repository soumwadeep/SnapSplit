import { Check, Copy, MessageCircle, WandSparkles } from 'lucide-react'
import { useState } from 'react'
import { buildShareText, whatsappShareUrl } from '../lib/share'
import type { Bill, Settlement } from '../types'

type ShareBarProps = {
  bill: Bill
  settlement: Settlement
  onSample: () => void
  isEmpty: boolean
}

export function ShareBar({ bill, settlement, onSample, isEmpty }: ShareBarProps) {
  const [copied, setCopied] = useState(false)

  const text = buildShareText(bill, settlement)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this summary', text)
    }
  }

  function whatsapp() {
    window.open(whatsappShareUrl(text), '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-violet-100/70">
        Share a readable recap — WhatsApp or clipboard. Totals stay exact after refresh.
      </p>
      <div className="flex flex-wrap gap-2">
        {isEmpty ? (
          <button type="button" className="btn-ghost" onClick={onSample}>
            <WandSparkles className="size-4" aria-hidden />
            Load sample bill
          </button>
        ) : null}
        <button type="button" className="btn-ghost" onClick={copy}>
          {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
          {copied ? 'Copied' : 'Copy summary'}
        </button>
        <button type="button" className="btn-primary" onClick={whatsapp}>
          <MessageCircle className="size-4" aria-hidden />
          WhatsApp
        </button>
      </div>
    </div>
  )
}
