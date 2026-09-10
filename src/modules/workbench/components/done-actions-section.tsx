import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DoneActionsSectionProps {
  count: number
  /** Wiersze wykonanych akcji — SortableActionRow z panelu (odhaczenie wraca na listę otwartych). */
  children: ReactNode
}

/**
 * Zwijana sekcja „Wykonane” (ADR-0040) — kontynuacja auto-sortu z ADR-0030: zrobione
 * zjeżdżają na dół listy, a od dziś lądują w zwiniętej sekcji na jej końcu. Nagłówek
 * jak w sekcji „Domknięte i porzucone”: licznik w badge, chevron pokazuje stan.
 */
export function DoneActionsSection({ count, children }: DoneActionsSectionProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <section className="mt-3" aria-label={`Wykonane akcje: ${count}`}>
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-1.5 rounded-md px-1 py-1.5 text-left text-xs font-medium text-muted-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ChevronDown className={cn('size-3.5 transition-transform', !expanded && '-rotate-90')} />
        Wykonane
        <span className="rounded-full bg-muted px-1.5 py-0.5 tabular-nums">{count}</span>
      </button>

      {expanded && <ul className="mt-1 space-y-1">{children}</ul>}
    </section>
  )
}
