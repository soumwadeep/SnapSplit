import { RotateCcw, Sparkles } from 'lucide-react'
import { Logo } from './Logo'

type HeaderProps = {
  onReset: () => void
}

export function Header({ onReset }: HeaderProps) {
  return (
    <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] px-5 py-6 shadow-card sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-violet-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <Logo size={52} />
          <div>
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
              <Sparkles className="size-3.5" aria-hidden />
              Cursor Mini App
            </p>
            <h1 className="mt-1 font-display text-4xl tracking-tight text-white sm:text-5xl">
              SnapSplit
            </h1>
            <p className="mt-1 max-w-md text-sm text-violet-100/70 sm:text-base">
              Split bills smarter — fair to the last cent, even when the table shares dessert.
            </p>
          </div>
        </div>
        <button type="button" className="btn-ghost self-start sm:self-center" onClick={onReset}>
          <RotateCcw className="size-4" aria-hidden />
          Reset bill
        </button>
      </div>
    </header>
  )
}
