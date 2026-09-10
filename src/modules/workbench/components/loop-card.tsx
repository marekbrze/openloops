import type { CSSProperties, KeyboardEvent, MouseEvent } from 'react'
import { Clock3, GripVertical, Trophy } from 'lucide-react'
import type { Loop, LoopAction } from '@/modules/data-layer'
import { cn } from '@/lib/utils'
import { FrogIcon } from '@/shared/components/frog-icon'
import { getCardStatusView, hasWaitingOn, overdueCount } from '../lib/workbench-ui'

/** Propsy uchwytu podłączone przez useSortable (typy luźne, bo API listenerów jest generyczne). */
export interface DragHandleProps {
  handleRef?: (element: HTMLButtonElement | null) => void
  attributes?: Record<string, unknown>
  listeners?: Record<string, unknown>
  dragging?: boolean
}

interface LoopCardProps extends DragHandleProps {
  loop: Loop
  actions: LoopAction[]
  selected: boolean
  todayKey: string
  onSelect: () => void
}

/**
 * Karta wątku na liście po lewej: tytuł, pochodne stanu (ADR-0038: bez pasa progresu), uchwyt DnD (ADR: grip).
 * ADR-0029: klik na kartę wyłącznie zaznacza — zmiana nazwy dzieje się w panelu akcji.
 */
export function LoopCard({
  loop,
  actions,
  selected,
  todayKey,
  onSelect,
  handleRef,
  attributes,
  listeners,
}: LoopCardProps) {
  const selectUnlessInteractive = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('[data-no-select]')) return
    onSelect()
  }
  const onKeyDownSelect = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      onSelect()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={selectUnlessInteractive}
      onKeyDown={onKeyDownSelect}
      className={cn(
        // Matte: hairline bez cienia (DESIGN.md „cienkie"); jeden sygnał hover (tinta), ring tylko dla zaznaczenia.
        'rounded-lg border bg-card p-2 transition-colors duration-150 hover:bg-muted',
        selected ? 'border-ring ring-2 ring-ring/30' : 'border-border',
        // Żaba (ADR-0037): cała karta w zieleni — odkładany wątek widoczny z lotu ptaka.
        loop.isFrog && 'border-success/40 bg-success/10 hover:bg-success/15',
      )}
    >
      <div className="flex items-start gap-1">
        <LoopGripHandle
          handleRef={handleRef}
          attributes={attributes}
          listeners={listeners}
          className="mt-1 shrink-0 text-muted-foreground"
        />
        {/* Tytuł i pochodne w jednej linii (feedback usera, ADR-0041): tytuł trzyma truncate, klaster po prawej jest shrink-0. */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {/* Żaba wątku (ADR-0037): zielony glyph przy tytule — widać bez otwierania wątku. */}
          <span className="flex min-w-0 items-center gap-1 text-sm font-medium">
            {loop.isFrog && <FrogIcon className="size-3.5 shrink-0 text-success-ink" />}
            <span className="truncate">{loop.title}</span>
            {loop.isFrog && <span className="sr-only">(żaba)</span>}
          </span>
          <CardStatusArea actions={actions} todayKey={todayKey} />
        </div>
      </div>
    </div>
  )
}

/**
 * Pochodne karty (ADR-0038 → ADR-0041) w linii tytułu, wyrównane do prawej: licznik per
 * wątek — zwycięstwa (zielony puchar, tinta tylko przy wartości > 0 — DESIGN.md) i otwarte
 * zadania + wskaźniki „czeka” i „po terminie”. Etykieta „cały czeka na innych” wypadła —
 * licznik i „czeka” mówią to samo.
 */
function CardStatusArea({ actions, todayKey }: { actions: LoopAction[]; todayKey: string }) {
  const view = getCardStatusView(actions)
  if (view.kind === 'empty') {
    return <span className="ml-auto shrink-0 text-xs italic text-muted-foreground">rozpisz kroki…</span>
  }

  const waiting = hasWaitingOn(actions)
  const overdue = overdueCount(actions, todayKey)

  return (
    <span className="ml-auto flex shrink-0 items-center gap-1.5">
      {/* Zwycięstwa wątku — liczba przy pucharze, tinta success tylko gdy > 0 (uczciwe zero bez zieleni). */}
      <span
        className={cn('flex shrink-0 items-center gap-1 text-xs tabular-nums', view.wins > 0 ? 'font-medium text-success-ink' : 'text-muted-foreground')}
        title="Zwycięstwa wątku — zrobione akcje"
      >
        <Trophy aria-hidden="true" className="size-3" />
        {view.wins}
      </span>
      <span aria-hidden="true" className="text-xs text-muted-foreground">
        ·
      </span>
      <span className="text-xs text-muted-foreground" title="Otwarte zadania wątku">
        {openTasksLabel(view.open)}
      </span>

      {waiting && (
        <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground" title="Wątek czeka (częściowo) na innych">
          <Clock3 className="size-3" />
          czeka
        </span>
      )}
      {overdue > 0 && (
        <span className="shrink-0 rounded-full bg-warning/15 px-1.5 py-0.5 text-xs font-medium text-warning-ink">
          {overdue} po terminie
        </span>
      )}
    </span>
  )
}

/** Polska liczba mnoga: 1 otwarte zadanie · 2 otwarte zadania · 5 otwartych zadań. */
function openTasksLabel(open: number): string {
  if (open === 1) return '1 otwarte zadanie'
  const plural = open % 10 >= 2 && open % 10 <= 4 && (open % 100 < 12 || open % 100 > 14)
  return `${open} ${plural ? 'otwarte zadania' : 'otwartych zadań'}`
}

/** Uchwyt rezerwowany dla useSortable — bez listenerów działa jak statyczna ikona. */
export function LoopGripHandle({
  handleRef,
  attributes,
  listeners,
  className,
}: DragHandleProps & { className?: string }) {
  return (
    <button
      ref={handleRef}
      type="button"
      data-no-select
      aria-label="Przeciągnij, aby zmienić kolejność"
      className={cn(
        'cursor-grab touch-none rounded p-0.5 focus-visible:ring-2 focus-visible:ring-ring',
        (!listeners || !attributes) && 'cursor-default opacity-40',
        className,
      )}
      {...(attributes as React.HTMLAttributes<HTMLButtonElement>)}
      {...(listeners as React.HTMLAttributes<HTMLButtonElement>)}
    >
      <GripVertical className="size-4" />
    </button>
  )
}

/** Przeniesienie karty podczas dragowania ponad resztę stosu. */
export function draggingStyle(transformStyle: string | undefined): CSSProperties | undefined {
  return transformStyle ? { transform: transformStyle, zIndex: 20 } : undefined
}
