import { useState } from 'react'
import type { CSSProperties } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Clock3, GripVertical, ListX, Sunrise, X } from 'lucide-react'
import { actionsRepo, dayKey, nowRepo } from '@/modules/data-layer'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { SkeletonCards } from '@/shared/components/skeleton-cards'
import { guard } from '@/shared/lib/mutations'
import { notify, openView } from '@/shared/lib/notify'
import { plDndAccessibility } from '@/shared/lib/pl-dnd'
import { formatClockTime, formatQueueMeta, formatTodayTitle } from '../lib/now-date'
import { useNowClock } from '../hooks/use-now-clock'
import { useNowQueue, useOpenLoopCount } from '../hooks/use-now'
import type { NowRow } from '../hooks/use-now'

/**
 * Ekran Teraz (ADR-0020) — domyślny widok aplikacji i główny ekran pracy:
 * dziś sprecyzowane datą i żywym zegarem + ręcznie układana kolejka wybranych akcji.
 * Kolejka żyje na danych źródłowych (ADR-0021); odhaczenie pisze dziennik tak samo
 * jak w workbench — ekran nie ma własnej semantyki zwycięstw.
 */
export function NowScreen() {
  const today = useNowClock()
  const [readRetry, setReadRetry] = useState(0)
  const { rows, readFailed, loading } = useNowQueue(readRetry)
  const openLoopCount = useOpenLoopCount()

  const doneCount = (rows ?? []).filter((row) => row.action.done).length

  return (
    <section aria-label="Teraz — dzisiejsza kolejka pracy" className="mx-auto flex h-full min-h-0 max-w-2xl flex-col">
      <header className="flex shrink-0 items-end justify-between gap-4 pb-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight">{formatTodayTitle(today)}</h1>
          {/* Meta kolejki dopiero z danymi — liczenie na undefined zawyżałoby stan pusty. */}
          {rows && <p className="pt-1 text-xs text-muted-foreground">{formatQueueMeta(rows.length - doneCount, doneCount)}</p>}
        </div>
        <time dateTime={formatClockTime(today)} className="shrink-0 text-3xl font-semibold tabular-nums tracking-tight">
          {formatClockTime(today)}
        </time>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pb-12">
        {readFailed ? (
          <NowReadError onRetry={() => setReadRetry((token) => token + 1)} />
        ) : loading || !rows ? (
          <SkeletonCards count={4} />
        ) : rows.length === 0 ? (
          <EmptyQueue hasOpenLoops={(openLoopCount ?? 0) > 0} />
        ) : (
          <NowQueue rows={rows} />
        )}
      </div>
    </section>
  )
}

function NowQueue({ rows }: { rows: NowRow[] }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const doneIds = rows.filter((row) => row.action.done).map((row) => row.action.id)

  /** Reordering dotyczy wyłącznie pozycji kolejki — źródła (wątki) zostają u siebie. */
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const oldIndex = rows.findIndex((row) => row.item.id === active.id)
    const newIndex = rows.findIndex((row) => row.item.id === over.id)
    void guard(() => nowRepo.reorder(arrayMove(rows, oldIndex, newIndex).map((row) => row.item.id)))
  }

  const removeDone = () => {
    void guard(() => nowRepo.removeByActionIds(doneIds)).then((ok) => {
      // Bez gramatycznych wariacji liczby — przycisk pokazuje ilość przed kliknięciem.
      if (ok) notify.info('Zdjęto zrobione pozycje z kolejki dnia.')
    })
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} accessibility={plDndAccessibility}>
        <SortableContext items={rows.map((row) => row.item.id)} strategy={verticalListSortingStrategy}>
          <ol aria-label="Kolejka Teraz — ręczna kolejność dnia" className="space-y-1">
            {rows.map((row, index) => (
              <SortableNowRow key={row.item.id} row={row} position={index + 1} />
            ))}
          </ol>
        </SortableContext>
      </DndContext>

      {/* ADR-0023: zrobione zostają w kolejce do świadomego zdjęcia; tu masowa droga. */}
      {doneIds.length > 0 && (
        <div className="mt-3 flex justify-center">
          <Button variant="outline" onClick={removeDone}>
            <ListX data-icon="inline-start" />
            Zdejmij zrobione ({doneIds.length})
          </Button>
        </div>
      )}
    </>
  )
}

interface SortableNowRowProps {
  row: NowRow
  position: number
}

/** Wiersz kolejki: numer · checkbox · treść z kontekstem wątku · zdejmij · uchwyt. */
function SortableNowRow({ row, position }: SortableNowRowProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: row.item.id,
  })
  const { action, loop } = row
  const waiting = action.ownerType === 'WaitingOn'
  const overdue = waiting && !action.done && Boolean(action.followUpDate) && action.followUpDate! < dayKey()

  return (
    <li
      ref={setNodeRef}
      style={{ ...(transform ? ({ transform: CSS.Transform.toString(transform), zIndex: 20 } satisfies CSSProperties) : {}), transition }}
      className={cn('group flex items-start gap-2 rounded-lg border border-border bg-card px-2 py-1.5 shadow-sm', isDragging && 'opacity-80')}
    >
      <span aria-hidden="true" className="w-5 shrink-0 pt-1 text-right text-xs tabular-nums text-muted-foreground">
        {position}.
      </span>

      <input
        type="checkbox"
        checked={action.done}
        onChange={() => void guard(() => actionsRepo.toggleDone(action))}
        aria-label={`${action.label} — wykonane`}
        className="mt-1 size-4 shrink-0 accent-[var(--primary)] focus-visible:ring-2 focus-visible:ring-ring"
      />

      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-sm', action.done ? 'text-muted-foreground line-through' : '')}>{action.label}</p>
        <p className="flex items-center gap-1.5 pt-0.5 text-[11px] text-muted-foreground">
          <span className="truncate">{loop.title}</span>
          {waiting && (
            <span className={cn('flex shrink-0 items-center gap-0.5', overdue && 'text-destructive')}>
              <Clock3 className="size-3" />
              czeka
            </span>
          )}
          {overdue && (
            <span className="shrink-0 rounded-full bg-destructive/10 px-1.5 font-medium text-destructive">po terminie</span>
          )}
        </p>
      </div>

      <button
        type="button"
        onClick={() => void guard(() => nowRepo.removeByActionId(action.id))}
        aria-label={`Zdejmij z kolejki: ${action.label}`}
        className="shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
      >
        <X className="size-3.5" />
      </button>

      <QueueGrip
        handleRef={setActivatorNodeRef}
        attributes={attributes as unknown as Record<string, unknown>}
        listeners={listeners as unknown as Record<string, unknown> | undefined}
        className="mt-0.5 shrink-0 text-muted-foreground"
      />
    </li>
  )
}

/** Uchwyt rezerwowany dla useSortable — bez listenerów działa jak statyczna ikona. */
function QueueGrip({
  handleRef,
  attributes,
  listeners,
  className,
}: {
  handleRef?: (element: HTMLButtonElement | null) => void
  attributes?: Record<string, unknown>
  listeners?: Record<string, unknown> | undefined
  className?: string
}) {
  return (
    <button
      ref={handleRef}
      type="button"
      aria-label="Przeciągnij, aby zmienić kolejność dnia"
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

/** Stan pusty rozróżnia świeży świat (za mało danych) od braku wyboru (są wątki, nic nie wybrane). */
function EmptyQueue({ hasOpenLoops }: { hasOpenLoops: boolean }) {
  return (
    <div className="mx-auto mt-6 max-w-sm rounded-xl border border-dashed border-border p-8 text-center">
      <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Sunrise className="size-5" />
      </span>
      <p className="pt-3 text-sm font-medium">{hasOpenLoops ? 'Kolejka na dziś jest jeszcze pusta.' : 'Zacznij od pierwszego wątku…'}</p>
      <p className="pt-1 text-xs text-muted-foreground">
        {hasOpenLoops
          ? 'Na liście Zadania oznacz akcje przełącznikiem „Teraz” — wskocz one w tę kolejkę.'
          : 'Workbench przechwyci temat i kroki; potem oznacz je przełącznikiem „Teraz”.'}
      </p>
      <Button className="mt-4" variant={hasOpenLoops ? 'default' : 'outline'} onClick={() => openView(hasOpenLoops ? 'tasks' : 'workbench')}>
        {hasOpenLoops ? 'Wybierz zadania' : 'Otwórz workbench'}
      </Button>
    </div>
  )
}

/**
 * Karta porażki odczytu (konwencja dziennika): komunikat + droga powrotu.
 * Dane IndexedDB zostają nietknięte — retry powtarza kwerendę kolejki.
 */
export function NowReadError({ onRetry }: { onRetry(): void }) {
  return (
    <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-center">
      <h2 className="text-base font-semibold">Teraz nie może odczytać kolejki</h2>
      <p className="pt-2 text-sm text-muted-foreground">
        Lokalna baza danych (IndexedDB) odrzuciła odczyt — najczęstsze powody to tryb prywatny
        albo zablokowana pamięć strony. Twoje wątki i kolejka zostały zapisane.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"
      >
        Spróbuj ponownie
      </button>
    </div>
  )
}
