import { useState } from 'react'
import { CheckCircle2, ChevronDown, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Zwycięstwo na liście: skończona akcja (małe zwycięstwo dziennika) + tytuł jej wątku. */
export interface WinEntry {
  id: string
  label: string
  loopTitle: string
  /** Data odhaczenia YYYY-MM-DD (z `doneAt`). */
  doneDay: string
}

interface WinsSectionProps {
  wins: WinEntry[]
}

/**
 * Zwijana sekcja „Zwycięstwa” (ADR-0039): puchar z licznikiem w nagłówku, po rozwinięciu
 * lista zrobionych zadań — najświeższe pierwsze. Zielony jak sukces (DESIGN.md), czytelnik
 * danych: tu nic się nie edytuje ani nie odhacza — historia zwycięstw żyje w dzienniku.
 */
export function WinsSection({ wins }: WinsSectionProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <section className="mt-4" aria-label={`Zwycięstwa: ${wins.length}`}>
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-1.5 rounded-md px-1 py-1.5 text-left text-xs font-medium text-muted-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ChevronDown className={cn('size-3.5 transition-transform', !expanded && '-rotate-90')} />
        {/* Puchar w zieleni zwycięstw (hue 150) — jedyny akcent koloru sekcji. */}
        <Trophy aria-hidden="true" className="size-3.5 shrink-0 text-success-ink" />
        Zwycięstwa
        <span className="rounded-full bg-success/15 px-1.5 py-0.5 tabular-nums text-success-ink">{wins.length}</span>
      </button>

      {expanded && (
        wins.length === 0 ? (
          <p className="px-3 py-2 text-xs italic text-muted-foreground">Jeszcze pusto — odhacz pierwszy krok.</p>
        ) : (
          <ul className="mt-1 space-y-1">
            {wins.map((win) => (
              <li key={win.id} className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-2 py-1.5">
                <CheckCircle2 aria-hidden="true" className="size-3.5 shrink-0 text-success" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{win.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{win.loopTitle}</p>
                </div>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{win.doneDay}</span>
              </li>
            ))}
          </ul>
        )
      )}
    </section>
  )
}
