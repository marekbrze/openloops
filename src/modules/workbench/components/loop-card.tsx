import type { CSSProperties, KeyboardEvent, MouseEvent } from 'react'
import { Clock3, GripVertical } from 'lucide-react'
import type { Loop, LoopAction } from '@/modules/data-layer'
import { cn } from '@/lib/utils'
import { getProgressView, hasWaitingOn, overdueCount } from '../lib/workbench-ui'

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
 * Karta wątku na liście po lewej: tytuł, progres/pochodne, uchwyt DnD (ADR: grip).
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
          <span className="block truncate text-sm font-medium">{loop.title}</span>
        </div>
      </div>

      <ProgressArea actions={actions} todayKey={todayKey} />
    </div>
  )
}

/** Pochodne karty: pasek progresu / etykieta zastępcza + wskaźniki „czeka” i „po terminie”. */
function ProgressArea({ actions, todayKey }: { actions: LoopAction[]; todayKey: string }) {
  const view = getProgressView(actions)
  const waiting = hasWaitingOn(actions)
  const overdue = overdueCount(actions, todayKey)

  return (
    <div className="flex items-center gap-2 pl-6 pr-1 pt-1.5">
      {view.kind === 'bar' && (
        <>
          <div
            className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={view.done}
            aria-valuemin={0}
            aria-valuemax={view.total}
            aria-label={`Progres mój ruch: ${view.done} z ${view.total}`}
          >
            <div
              data-testid="progress-fill"
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${Math.round((view.done / view.total) * 100)}%` }}
            />
          </div>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {view.done}/{view.total}
          </span>
        </>
      )}
      {view.kind === 'waiting-only' && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock3 className="size-3" />
          cały czeka na innych · {view.waiting}
        </span>
      )}
      {view.kind === 'empty' && (
        <span className="text-xs italic text-muted-foreground">rozpisz kroki…</span>
      )}

      {view.kind !== 'waiting-only' && waiting && (
        <span className="ml-auto flex shrink-0 items-center gap-1 text-xs text-muted-foreground" title="Wątek czeka częściowo na innych">
          <Clock3 className="size-3" />
          czeka
        </span>
      )}
      {overdue > 0 && (
        <span className="ml-auto shrink-0 rounded-full bg-warning/15 px-1.5 py-0.5 text-xs font-medium text-warning-ink">
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
