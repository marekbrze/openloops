import { ListPlus, ListX, Trash2 } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { actionsRepo, dayKey, nowRepo } from '@/modules/data-layer'
import type { LoopAction } from '@/modules/data-layer'
import { cn } from '@/lib/utils'
import { EditableText } from '@/shared/components/editable-text'
import { guard } from '@/shared/lib/mutations'
import { draggingStyle, LoopGripHandle } from './loop-card'

interface ActionRowProps {
  action: LoopAction
  /** Czy akcja leży w kolejce Teraz; `undefined` = członkostwo jeszcze nieczytelne (przełącznik czeka). */
  picked?: boolean | undefined
  /** Panel decyduje: done wymaga potwierdzenia, undone znika od razu. */
  onRequestDelete: (action: LoopAction) => void
}

/** Jednoliniowy wiersz akcji (decyzja layoutu lofi): checkbox · etykieta · typ · dopytanie · Teraz · uchwyt. */
export function SortableActionRow({ action, picked, onRequestDelete }: ActionRowProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: action.id,
  })
  const waiting = action.ownerType === 'WaitingOn'
  const overdue = waiting && !action.done && Boolean(action.followUpDate) && action.followUpDate! < dayKey()

  return (
    <li
      ref={setNodeRef}
      style={{ ...draggingStyle(transform ? CSS.Transform.toString(transform) : undefined), transition }}
      className={cn(
        'group flex items-center gap-1 rounded-lg border border-border bg-card px-1.5 py-1 shadow-sm',
        isDragging && 'opacity-80',
      )}
    >
      <input
        type="checkbox"
        checked={action.done}
        onChange={() => void guard(() => actionsRepo.toggleDone(action))}
        aria-label={`${action.label} — wykonane`}
        data-no-select
        className="size-4 shrink-0 accent-[var(--primary)] focus-visible:ring-2 focus-visible:ring-ring"
      />
      <div className="min-w-0 flex-1" data-no-select>
        <EditableText
          value={action.label}
          onChange={(label) => void guard(() => actionsRepo.update(action.id, { label }))}
          ariaLabel="Etykieta akcji"
          className={cn('text-sm', action.done && 'text-muted-foreground line-through')}
        />
      </div>

      {/* Przełącznik typu — dedykowana kontrolka danych strukturalnych (ADR-0009). */}
      <OwnerTypeToggle action={action} />

      {waiting && (
        <FollowUpDateField
          date={action.followUpDate ?? ''}
          done={action.done}
          overdue={overdue}
          onChange={(date) =>
            void guard(() => actionsRepo.update(action.id, { followUpDate: date === '' ? undefined : date }))
          }
        />
      )}

      {/* ADR-0022: dołączanie do Teraz to druga kontrolka obok checkboxa, nigdy jego zamiana. */}
      <PickForNowToggle action={action} picked={picked} />

      <button
        type="button"
        onClick={() => onRequestDelete(action)}
        aria-label={`Usuń akcję: ${action.label}`}
        data-no-select
        className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
      >
        <Trash2 className="size-3.5" />
      </button>

      <LoopGripHandle
        handleRef={setActivatorNodeRef}
        attributes={attributes as unknown as Record<string, unknown>}
        listeners={listeners as unknown as Record<string, unknown> | undefined}
        className="shrink-0 text-muted-foreground"
      />
    </li>
  )
}

/**
 * Przełącznik dołączenia do kolejki Teraz (ADR-0022): osobna kontrolka obok checkboxa,
 * wyłączona dla done — skończone zadanie nie wraca do planowania dnia.
 */
function PickForNowToggle({ action, picked }: { action: LoopAction; picked?: boolean | undefined }) {
  const toggle = () =>
    void guard(() => (picked ? nowRepo.removeByActionId(action.id) : nowRepo.add(action.id)))
  const disabled = Boolean(action.done) || picked === undefined

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      aria-pressed={picked ?? false}
      aria-label={picked ? `Zdejmij z kolejki Teraz: ${action.label}` : `Dodaj do kolejki Teraz: ${action.label}`}
      title="Kolejka Teraz"
      data-no-select
      className={cn(
        'shrink-0 rounded-md p-1 transition-colors focus-visible:ring-2 focus-visible:ring-ring',
        // Zawsze widoczny — to podstawowa droga dołączania do dnia, nie operacja destrukcyjna.
        picked ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-muted',
        disabled && 'cursor-not-allowed opacity-40 hover:bg-transparent',
      )}
    >
      {picked ? <ListX className="size-3.5" /> : <ListPlus className="size-3.5" />}
    </button>
  )
}

function OwnerTypeToggle({ action }: { action: LoopAction }) {
  const setOwner = (ownerType: LoopAction['ownerType']) => {
    if (action.ownerType === ownerType) return
    // Data dopytania jest znaczeniem tylko przy czekaniu — przejście na mój ruch ją czyści.
    const patch: Partial<LoopAction> =
      ownerType === 'MyMove'
        ? { ownerType: 'MyMove', followUpDate: undefined }
        : { ownerType: 'WaitingOn' }
    void guard(() => actionsRepo.update(action.id, patch))
  }

  return (
    <div role="group" aria-label={`Typ akcji: ${waitingLabel(action)}`} data-no-select>
      <ToggleOption label="Mój ruch" active={action.ownerType === 'MyMove'} onSelect={() => setOwner('MyMove')} />
      <ToggleOption label="Czekam" active={action.ownerType === 'WaitingOn'} onSelect={() => setOwner('WaitingOn')} />
    </div>
  )
}

const waitingLabel = (action: LoopAction) => (action.ownerType === 'MyMove' ? 'mój ruch' : 'czekam na kogoś')

function ToggleOption({ label, active, onSelect }: { label: string; active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        'rounded-md px-1.5 py-0.5 text-[11px] whitespace-nowrap transition-colors',
        active
          ? 'bg-secondary font-medium text-secondary-foreground'
          : 'text-muted-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
      )}
    >
      {label}
    </button>
  )
}

function FollowUpDateField({
  date,
  done,
  overdue,
  onChange,
}: {
  date: string
  done: boolean
  overdue: boolean
  onChange: (value: string) => void
}) {
  const describedBy = overdue ? 'followup-overdue-hint' : undefined
  return (
    <>
      <input
        type="date"
        value={date}
        onChange={(e) => onChange(e.target.value)}
        aria-label={overdue && !done ? 'Data dopytania — po terminie' : 'Data dopytania'}
        aria-describedby={describedBy}
        data-no-select
        className={cn(
          'w-[7.5rem] shrink-0 rounded-md border bg-background px-1 py-0.5 text-[11px] outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
          overdue && !done ? 'border-destructive text-destructive' : 'border-border text-muted-foreground',
        )}
      />
      {overdue && !done && (
        <span id="followup-overdue-hint" className="sr-only">
          Ta akcja przekroczyła datę dopytania.
        </span>
      )}
    </>
  )
}
