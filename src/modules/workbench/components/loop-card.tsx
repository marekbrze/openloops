import type { CSSProperties, KeyboardEvent, MouseEvent } from 'react'
import { Clock3, GripVertical } from 'lucide-react'
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
        <div className="min-w-0 flex-1">
          {/* Żaba wątku (ADR-0037): zielony glyph przy tytule — widać bez otwierania wątku. */}
          <span className="flex min-w-0 items-center gap-1 text-sm font-medium">
            {loop.isFrog && <FrogIcon className="size-3.5 shrink-0 text-success-ink" />}
            <span className="truncate">{loop.title}</span>
            {loop.isFrog && <span className="sr-only">(żaba)</span>}
          </span>
        </div>
      </div>

      <CardStatusArea actions={actions} todayKey={todayKey} />
    </div>
  )
}

/**
 * Pochodne karty (ADR-0038): etykieta stanu zamiast pasa progresu + wskaźniki „czeka”
 * i „po terminie”. Wątek rozpisany na „mój ruch” nie pokazuje żadnej pochodnej —
 * licznik otwartych wątków żyje w nagłówku kolumny.
 */
function CardStatusArea({ actions, todayKey }: { actions: LoopAction[]; todayKey: string }) {
  const view = getCardStatusView(actions)
  const waiting = hasWaitingOn(actions)
  const overdue = overdueCount(actions, todayKey)
  const status =
    view.kind === 'waiting-only' ? (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Clock3 className="size-3" />
        cały czeka na innych · {view.waiting}
      </span>
    ) : view.kind === 'empty' ? (
      <span className="text-xs italic text-muted-foreground">rozpisz kroki…</span>
    ) : undefined

  if (!status && !waiting && overdue === 0) return null

  return (
    <div className="flex items-center gap-2 pl-6 pr-1 pt-1.5">
      {status}
      {view.kind !== 'waiting-only' && waiting && (
        <span className={cn('flex shrink-0 items-center gap-1 text-xs text-muted-foreground', !status && 'ml-auto')} title="Wątek czeka częściowo na innych">
          <Clock3 className="size-3" />
          czeka
        </span>
      )}
      {overdue > 0 && (
        <span className={cn('shrink-0 rounded-full bg-warning/15 px-1.5 py-0.5 text-xs font-medium text-warning-ink', !status && 'ml-auto')}>
          {overdue} po terminie
        </span>
      )}
    </div>
  )
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
