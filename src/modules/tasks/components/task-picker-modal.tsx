import { useState } from 'react'
import { Inbox, ListPlus, ListX, Clock3, X } from 'lucide-react'
import type { LoopAction } from '@/modules/data-layer'
import { dayKey, nowRepo } from '@/modules/data-layer'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/shared/components/dialog'
import { SkeletonCards } from '@/shared/components/skeleton-cards'
import { guard } from '@/shared/lib/mutations'
import { openView } from '@/shared/lib/notify'
import { READ_ERROR, usePickedActionIds } from '@/modules/now/hooks/use-now'
import { useTaskCatalog } from '../hooks/use-tasks'
import type { TaskGroup } from '../hooks/use-tasks'

interface TaskPickerModalProps {
  open: boolean
  onClose: () => void
}

/**
 * Katalog wszystkich zadań (ADR-0022) jako modal na ekranie Teraz (ADR-0024) — łatwy wybór
 * „co robię dalej" bez opuszczania głównego ekranu pracy: akcje otwartych wątków pogrupowane
 * po wątku, każdy wiersz z przełącznikiem kolejki Teraz; kolejka pod spodem odświeża się na żywo.
 * Powierzchnia tylko do odczytu i wyboru: edycja treści/typu/usuwanie zostaje w workbench,
 * więc mutacje struktury mają jedno miejsce.
 */
export function TaskPickerModal({ open, onClose }: TaskPickerModalProps) {
  const [readRetry, setReadRetry] = useState(0)
  const { groups, readFailed, loading } = useTaskCatalog(readRetry)
  // Wspólny retry-token — „Spróbuj ponownie" odgrzewa i katalog, i członkostwo (luka #5).
  const pickedIds = usePickedActionIds(readRetry)
  const membershipFailed = pickedIds === READ_ERROR

  const todoCount = (groups ?? []).reduce((sum, group) => sum + group.actions.filter((a) => !a.done).length, 0)
  const hasOpenLoops = (groups ?? []).length > 0
  const hasAnyAction = (groups ?? []).some((group) => group.actions.length > 0)

  /** Stany puste prowadzą do workbench — modal zamyka się przed nawigacją. */
  const goToWorkbench = () => {
    onClose()
    openView('workbench')
  }

  return (
    <Dialog open={open} onClose={onClose} labelId="task-picker-title" describeId="task-picker-hint" className="max-w-2xl">
      <div className="flex items-center gap-3">
        <h2 id="task-picker-title" className="text-base font-semibold tracking-tight">
          Wybierz zadania
        </h2>
        {/* Luka #2: licznik dopiero z danymi — „0 do zrobienia" przy szkielecie kłamało. */}
        {groups && <span className="shrink-0 text-xs text-muted-foreground">{todoCount} do zrobienia</span>}
        <button
          type="button"
          onClick={onClose}
          aria-label="Zamknij wybór zadań"
          className="-mr-1 ml-auto shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-4" />
        </button>
      </div>
      <p id="task-picker-hint" className="pt-0.5 text-xs text-muted-foreground">
        Przełącznik przy akcji dokłada ją do kolejki Teraz — widocznej pod spodem.
      </p>

      {/* Długi katalog scrolluje się w panelu, nie rozciąga strony pod spodem. */}
      <div className="mt-3 max-h-[60vh] min-h-0 overflow-y-auto pb-1 pr-0.5">
        {readFailed || membershipFailed ? (
          <CatalogueReadError onRetry={() => setReadRetry((token) => token + 1)} />
        ) : loading || !groups ? (
          <SkeletonCards count={4} />
        ) : !hasOpenLoops ? (
          <EmptyCatalogue
            heading="Żadnego otwartego wątku"
            body="Zacznij w workbench: przechwyć temat i rozpisz kroki — pojawią się tutaj."
            actionLabel="Otwórz workbench"
            onAction={goToWorkbench}
          />
        ) : !hasAnyAction ? (
          <EmptyCatalogue
            heading="Wątki bez kroków"
            body="Otwórz wątek w workbench i dopisz pierwsze działania — wtedy wybierzesz je do Teraz."
            actionLabel="Otwórz workbench"
            onAction={goToWorkbench}
          />
        ) : (
          <ul className="space-y-5" aria-label="Grupy zadań według wątków">
            {groups.map((group) => (
              <li key={group.loop.id}>
                <TaskGroupHeading group={group} />
                <ul className="mt-1.5 space-y-1" aria-label={`Zadania wątku ${group.loop.title}`}>
                  {group.actions.map((action) => (
                    <TaskRow
                      key={action.id}
                      action={action}
                      picked={pickedIds instanceof Set ? pickedIds.has(action.id) : undefined}
                    />
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Dialog>
  )
}

function TaskGroupHeading({ group }: { group: TaskGroup }) {
  const done = group.actions.filter((action) => action.done).length
  const total = group.actions.length
  return (
    <div className="flex items-baseline gap-2 border-b border-border px-0.5 pb-1">
      {/* Luka #3: tytuł wątku w jednej linii — długi tytuł nie spycha bilansu done/total. */}
      <h3 title={group.loop.title} className="min-w-0 truncate text-sm font-semibold tracking-tight">
        {group.loop.title}
      </h3>
      <span className="ml-auto shrink-0 text-xs tabular-nums text-muted-foreground">
        {done}/{total}
      </span>
    </div>
  )
}

interface TaskRowProps {
  action: LoopAction
  /** `undefined` = członkostwo jeszcze nieczytelne — przełącznik czeka, by nie kłamać stanem. */
  picked: boolean | undefined
}

function TaskRow({ action, picked }: TaskRowProps) {
  const waiting = action.ownerType === 'WaitingOn'
  const overdue = waiting && !action.done && Boolean(action.followUpDate) && action.followUpDate! < dayKey()

  // Done nie wraca do planowania: checkbox robi dziennik, a nie kolejkę (ADR-0022).
  const toggle = () =>
    void guard(() => (picked ? nowRepo.removeByActionId(action.id) : nowRepo.add(action.id)))

  return (
    <li
      className={cn(
        'flex items-center gap-1.5 rounded-lg border border-border bg-card py-1 pl-6 pr-2 transition-colors duration-150 hover:bg-muted/60',
        action.done && 'opacity-70',
      )}
    >
      <button
        type="button"
        onClick={toggle}
        disabled={Boolean(action.done) || picked === undefined}
        aria-pressed={picked ?? false}
        aria-label={picked ? `Zdejmij z kolejki Teraz: ${action.label}` : `Dodaj do kolejki Teraz: ${action.label}`}
        className={cn(
          'shrink-0 rounded-md p-1 transition-colors focus-visible:ring-2 focus-visible:ring-ring',
          picked ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground hover:bg-muted',
          (action.done || picked === undefined) && 'cursor-not-allowed opacity-40 hover:bg-transparent',
        )}
      >
        {picked ? <ListX className="size-3.5" /> : <ListPlus className="size-3.5" />}
      </button>

      <span
        title={action.label}
        className={cn('min-w-0 flex-1 truncate text-sm', action.done && 'text-muted-foreground line-through')}
      >
        {action.label}
      </span>

      <span className="shrink-0 text-xs whitespace-nowrap text-muted-foreground">
        {waiting ? 'czekam' : 'mój ruch'}
      </span>

      {waiting && overdue && (
        <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-warning/15 px-1.5 py-0.5 text-xs font-medium text-warning-ink">
          <Clock3 className="size-3" />
          po terminie
        </span>
      )}
    </li>
  )
}

function EmptyCatalogue({
  heading,
  body,
  actionLabel,
  onAction,
}: {
  heading: string
  body: string
  actionLabel: string
  onAction(): void
}) {
  return (
    <div className="mx-auto my-4 max-w-sm rounded-xl border border-dashed border-border p-8 text-center">
      <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Inbox className="size-5" />
      </span>
      <p className="pt-3 text-sm font-medium">{heading}</p>
      <p className="pt-1 text-xs text-muted-foreground">{body}</p>
      <Button variant="outline" className="mt-4" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  )
}

/** Karta porażki odczytu (konwencja dziennika): komunikat + retry; dane zostają nietknięte. */
export function CatalogueReadError({ onRetry }: { onRetry(): void }) {
  return (
    <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-center">
      <h3 className="text-base font-semibold">Katalog zadań nie może odczytać danych</h3>
      <p className="pt-2 text-sm text-muted-foreground">
        Lokalna baza danych (IndexedDB) odrzuciła odczyt — najczęstsze powody to tryb prywatny
        albo zablokowana pamięć strony. Twoje wątki zostały zapisane.
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
