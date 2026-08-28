import { useState } from 'react'
import { CheckCircle2, ChevronDown, CircleSlash, RotateCcw, Trash2 } from 'lucide-react'
import type { Loop } from '@/modules/data-layer'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ClosedLoopsSectionProps {
  loops: Loop[]
  onRequestDelete: (loop: Loop) => void
  onReopen: (loop: Loop) => void
}

const dateOf = (loop: Loop) => (loop.closedAt ?? loop.abandonedAt ?? loop.updatedAt).slice(0, 10)

/**
 * Zwijana sekcja „Domknięte i porzucone” (ADR-0002): licznik w nagłówku,
 * przy karcie Reopen + Usuń…. Domknięte i porzucone na jednej liście, ze znakiem statusu.
 */
export function ClosedLoopsSection({ loops, onRequestDelete, onReopen }: ClosedLoopsSectionProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <section className="mt-4" aria-label={`Domknięte i porzucone: ${loops.length}`}>
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-1.5 rounded-md px-1 py-1.5 text-left text-xs font-medium text-muted-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ChevronDown className={cn('size-3.5 transition-transform', !expanded && '-rotate-90')} />
        Domknięte i porzucone
        <span className="rounded-full bg-muted px-1.5 py-0.5 tabular-nums">{loops.length}</span>
      </button>

      {expanded && (
        loops.length === 0 ? (
          <p className="px-3 py-2 text-xs italic text-muted-foreground">Nic tu jeszcze nie leży.</p>
        ) : (
          <ul className="mt-1 space-y-1">
            {loops.map((loop) => (
              <li key={loop.id} className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-2 py-1.5">
                {loop.status === 'closed' ? (
                  <CheckCircle2 aria-label="Domknięty" className="size-3.5 shrink-0 text-success" />
                ) : (
                  <CircleSlash aria-label="Porzucony" className="size-3.5 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{loop.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {loop.status === 'closed' ? 'domknięty' : 'porzucony'} · {dateOf(loop)}
                  </p>
                </div>
                <Button variant="ghost" size="xs" onClick={() => onReopen(loop)}>
                  <RotateCcw /> Otwórz ponownie
                </Button>
                <Button variant="ghost" size="icon-xs" onClick={() => onRequestDelete(loop)} aria-label={`Usuń wątek ${loop.title}`}>
                  <Trash2 className="text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )
      )}
    </section>
  )
}
