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
import { Clock3, GripVertical, ListPlus, ListX, Sunrise, X } from 'lucide-react'
import { actionsRepo, dayKey, nowRepo } from '@/modules/data-layer'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { SkeletonCards } from '@/shared/components/skeleton-cards'
import { guard } from '@/shared/lib/mutations'
import { notify, openView } from '@/shared/lib/notify'
import { plDndAccessibility } from '@/shared/lib/pl-dnd'
import { TaskPickerModal } from '@/modules/tasks'
import { formatClockTime, formatQueueMeta, formatTodayTitle } from '../lib/now-date'
import { useNowClock } from '../hooks/use-now-clock'
import { READ_ERROR, useNowQueue, useOpenLoopCount } from '../hooks/use-now'
import type { NowRow } from '../hooks/use-now'

/**
 * Ekran Teraz (ADR-0020) — domyślny widok aplikacji i główny ekran pracy:
 * dziś sprecyzowane datą i żywym zegarem + ręcznie układana kolejka wybranych akcji.
 * Kolejka żyje na danych źródłowych (ADR-0021); odhaczenie pisze dziennik tak samo
 * jak w workbench — ekran nie ma własnej semantyki zwycięstw.
 * Dobieranie zadań: modal „Wybierz zadania" nad tym ekranem (ADR-0024).
 */
export function NowScreen() {
  const today = useNowClock()
  const [readRetry, setReadRetry] = useState(0)
  const [pickerOpen, setPickerOpen] = useState(false)
  const { rows, readFailed, loading } = useNowQueue(readRetry)
  // Ten sam retry-token co kolejka — porażka któregokolwiek odczytu ma wspólną drogę powrotu.
  const openLoopCount = useOpenLoopCount(readRetry)

  const doneCount = (rows ?? []).filter((row) => row.action.done).length
  const retryRead = () => setReadRetry((token) => token + 1)

  return (
    <>
      <section aria-label="Teraz — dzisiejsza kolejka pracy" className="mx-auto flex h-full min-h-0 max-w-2xl flex-col">
        <header className="flex shrink-0 items-end justify-between gap-4 pb-4">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight">{formatTodayTitle(today)}</h1>
            {/* Meta kolejki dopiero z danymi — liczenie na undefined zawyżałoby stan pusty. */}
            {rows && <p className="pt-1 text-xs text-muted-foreground">{formatQueueMeta(rows.length - doneCount, doneCount)}</p>}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            {/* Zegar w Geist Mono (DESIGN.md: mono tylko zegar/liczby, tabular-nums). */}
            <time dateTime={formatClockTime(today)} className="font-mono text-2xl font-semibold tabular-nums tracking-tight">
              {formatClockTime(today)}
            </time>
            {/* ADR-0024: dobieranie zadań bez opuszczania głównego ekranu pracy. */}
            <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
              <ListPlus data-icon="inline-start" />
              Wybierz zadania
            </Button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto pb-12">
          {readFailed ? (
            <NowReadError onRetry={retryRead} />
          ) : loading || !rows ? (
            <SkeletonCards count={4} />
          ) : rows.length > 0 ? (
            <NowQueue rows={rows} />
          ) : openLoopCount === undefined ? (
            /* Luka #1: wariant stanu pustego dopiero na rozstrzygniętej liczbie wątków —
             * inaczej mrugałoby „świeży świat" z CTA do workbench dla kogoś, kto wątki ma. */
            <SkeletonCards count={4} />
          ) : openLoopCount === READ_ERROR ? (
            <NowReadError onRetry={retryRead} />
          ) : (
            <EmptyQueue hasOpenLoops={openLoopCount > 0} onPickTasks={() => setPickerOpen(true)} />
          )}
        </div>
      </section>

      <TaskPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </>
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
    // Luka #2: wiersze mogły się zmienić w trakcie przeciągania — zapis z −1 ułożyłby dzień fałszywie.
    if (oldIndex === -1 || newIndex === -1) return
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
      /* Matte: hairline zamiast cienia (DESIGN.md „cienkie"); subtelny hover jako feedback. */
      className={cn(
        'group flex items-start gap-2 rounded-lg border border-border bg-card px-2 py-1.5 transition-colors duration-150 hover:bg-muted/60',
        isDragging && 'opacity-80',
      )}
    >
      {/* Luka #5: min-w zamiast stałej szerokości — numeracja ≥ 100 nie nachodzi na checkbox. */}
      <span aria-hidden="true" className="min-w-5 shrink-0 pt-1 text-right text-xs tabular-nums text-muted-foreground">
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
        {/* Luka #4: title przy pełnej treści — truncation bez utraty dostępu do całości (konwencja dziennika). */}
        <p title={action.label} className={cn('truncate text-sm', action.done ? 'text-muted-foreground line-through' : '')}>
          {action.label}
        </p>
        <p className="flex items-center gap-1.5 pt-0.5 text-xs text-muted-foreground">
          <span title={loop.title} className="truncate">
            {loop.title}
          </span>
          {/* Przeterminowane dopytanie = warning (DESIGN.md); destructive zostaje dla błędów i usuwania. */}
          {waiting && (
            <span className={cn('flex shrink-0 items-center gap-0.5', overdue && 'text-warning-ink')}>
              <Clock3 className="size-3" />
              czeka
            </span>
          )}
          {overdue && (
            <span className="shrink-0 rounded-full bg-warning/15 px-1.5 font-medium text-warning-ink">po terminie</span>
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
function EmptyQueue({ hasOpenLoops, onPickTasks }: { hasOpenLoops: boolean; onPickTasks: () => void }) {
  return (
    <div className="mx-auto mt-6 max-w-sm rounded-xl border border-dashed border-border p-8 text-center">
      <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Sunrise className="size-5" />
      </span>
      <p className="pt-3 text-sm font-medium">{hasOpenLoops ? 'Kolejka na dziś jest jeszcze pusta.' : 'Zacznij od pierwszego wątku…'}</p>
      <p className="pt-1 text-xs text-muted-foreground">
        {hasOpenLoops
          ? 'Otwórz „Wybierz zadania” i oznacz akcje przełącznikiem „Teraz” — wskoczą one w tę kolejkę.'
          : 'Workbench przechwyci temat i kroki; potem oznacz je przełącznikiem „Teraz”.'}
      </p>
      {/* ADR-0024: oba CTA — modal nad tym ekranem albo workbench; zero przeskoku zakładką. */}
      <Button className="mt-4" variant={hasOpenLoops ? 'default' : 'outline'} onClick={hasOpenLoops ? onPickTasks : () => openView('workbench')}>
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
      <Button className="mt-4" onClick={onRetry}>
        Spróbuj ponownie
      </Button>
    </div>
  )
}
