import { useMemo, useState } from 'react'
import { Inbox } from 'lucide-react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { actionsRepo, closeLoopWithWin, loopsRepo } from '@/modules/data-layer'
import type { LoopAction } from '@/modules/data-layer'
import { Button } from '@/components/ui/button'
import { SimpleMenu } from '@/shared/components/simple-menu'
import { ConfirmDialog } from '@/shared/components/confirm-dialog'
import { EditableText } from '@/shared/components/editable-text'
import { guard } from '@/shared/lib/mutations'
import { notify, openView } from '@/shared/lib/notify'
import { plDndAccessibility } from '@/shared/lib/pl-dnd'
import { usePickedActionIds } from '@/modules/now/hooks/use-now'
import { useLoop, useLoopActions } from '../hooks/use-workbench'
import { ActionAddForm } from './action-add-form'
import { CloseLoopModal } from './close-loop-modal'
import { PinnedGoal } from './pinned-goal'
import { SortableActionRow } from './action-row'

interface ActionPanelProps {
  loopId?: string
  /** Pusty świat pierwszego uruchomienia — placeholder mówi „nazwij pierwszy wątek” zamiast „wybierz”. */
  firstRun?: boolean
}

/**
 * Prawa kolumna workbench: akcje zaznaczonego wątku z przypiętym celem na końcu.
 * Hardening: panel nie renderuje wątków zamkniętych/porzuconych (luka #1) —
 * domknięcie zaznaczonego wątku zawsze schodzi do placeholda.
 */
export function ActionPanel({ loopId, firstRun }: ActionPanelProps) {
  const loop = useLoop(loopId)
  const actions = useLoopActions(loopId)
  // Jedna kwerenda członkostwa Teraz na cały panel — wiersze nie utrzymują własnych liveQuery.
  const pickedIds = usePickedActionIds()
  const [closeOpen, setCloseOpen] = useState(false)
  const [pendingDeleteAction, setPendingDeleteAction] = useState<LoopAction | undefined>(undefined)
  const [confirmLoopDelete, setConfirmLoopDelete] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  /**
   * Auto-sort (ADR-0030): zrobione zawsze zjeżdżają na dół listy, każda grupa wewnątrz
   * siebie zachowuje ręczną kolejność (sortOrder). Odhaczenie wraca na swoje dawne miejsce.
   */
  const orderedActions = useMemo(
    () => [...actions.filter((a) => !a.done), ...actions.filter((a) => a.done)],
    [actions],
  )

  if (!loop || loop.status !== 'open') return <PanelPlaceholder firstRun={firstRun} />

  /** Reordering nie ma dostępu do celu — SortableContext obejmuje wyłącznie akcje (ADR priority area). */
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const oldIndex = orderedActions.findIndex((a) => a.id === active.id)
    const newIndex = orderedActions.findIndex((a) => a.id === over.id)
    void guard(() => actionsRepo.reorder(arrayMove(orderedActions, oldIndex, newIndex).map((a) => a.id)))
  }

  /** ACTIONS.md: done-akcja znika za potwierdzeniem (traci bieżące zwycięstwo); undone natychmiast. */
  const requestDeleteAction = (action: LoopAction) => {
    if (action.done) setPendingDeleteAction(action)
    else void guard(() => actionsRepo.remove(action))
  }

  return (
    <section aria-label={`Panel akcji wątku ${loop.title}`} className="flex h-full min-h-0 flex-col">
      <header className="shrink-0 border-b border-border pb-3">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1" data-no-select>
            <EditableText
              value={loop.title}
              onChange={(title) => void guard(() => loopsRepo.update(loop.id, { title }))}
              ariaLabel="Tytuł wątku"
              placeholder="Bez tytułu"
              className="text-base font-semibold tracking-tight"
            />
          </div>

          {/* ADR-0001/0010: główne CTA nagłówka + rzadkie/destrukcyjne w menu ⋯ */}
          <Button onClick={() => setCloseOpen(true)}>Domknij</Button>
          <SimpleMenu
            ariaLabel="Więcej akcji wątku"
            items={[
              {
                label: 'Porzuć wątek',
                onSelect: () =>
                  void guard(() => loopsRepo.abandon(loop.id)).then((ok) => {
                    if (ok) notify.info('Wątek porzucony — porzucenie nie liczy się jako zwycięstwo.')
                  }),
                destructive: false,
              },
              { label: 'Usuń…', onSelect: () => setConfirmLoopDelete(true), destructive: true },
            ]}
          />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pb-12 pt-3">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} accessibility={plDndAccessibility}>
          <SortableContext items={orderedActions.map((a) => a.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-1" aria-label="Działania wątku — otwarte wg ręcznej kolejności, wykonane na końcu">
              {actions.length === 0 ? (
                <EmptyActionsHint />
              ) : (
                orderedActions.map((action) => (
                  <SortableActionRow
                    key={action.id}
                    action={action}
                    // READ_ERROR (porażka odczytu) traktowane jak nieczytelne członkostwo — przełącznik czeka.
                    picked={pickedIds instanceof Set ? pickedIds.has(action.id) : undefined}
                    onRequestDelete={requestDeleteAction}
                  />
                ))
              )}
            </ul>
          </SortableContext>
        </DndContext>

        {/* Nowe kroki (zawsze niezrobione) lądują na końcu grupy otwartych — nad zrobionymi i celem. */}
        <div className="mt-2">
          <ActionAddForm onAdd={(label) => guard(() => actionsRepo.add(loop.id, label, 'MyMove'))} />
        </div>

        <PinnedGoal goalText={loop.goalText} onUpdate={(goalText) => void guard(() => loopsRepo.update(loop.id, { goalText }))} />
      </div>

      {/* Moment domknięcia (ADR-0001): celebracja; po potwierdzeniu toast z przejściem do Dziennika (luka #5). */}
      <CloseLoopModal
        loop={closeOpen ? loop : null}
        onClose={() => setCloseOpen(false)}
        onConfirm={async () => {
          const ok = await guard(() => closeLoopWithWin(loop))
          if (!ok) return // zostaw modal otwarty — baner błędu tłumaczy co poszło nie tak
          setCloseOpen(false)
          notify.action(`Domknięto „${loop.title}” · większe zwycięstwo czeka w Dzienniku`, 'Otwórz dziennik', () =>
            openView('journal'),
          )
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingDeleteAction)}
        heading="Usunąć wykonaną akcję?"
        body={`„${pendingDeleteAction?.label ?? ''}” zniknie z listy, a bilans dnia utraci jej dzisiejsze zwycięstwo. Snapshoty z poprzednich dni zostają.`}
        onCancel={() => setPendingDeleteAction(undefined)}
        onConfirm={() => {
          if (pendingDeleteAction) void guard(() => actionsRepo.remove(pendingDeleteAction))
          setPendingDeleteAction(undefined)
        }}
      />

      <ConfirmDialog
        open={confirmLoopDelete}
        heading="Usunąć wątek?"
        body={`„${loop.title}” zniknie razem z akcjami i celem. Wpisy dziennika zostają — mają snapshot tekstu.`}
        confirmLabel="Usuń bezpowrotnie"
        onCancel={() => setConfirmLoopDelete(false)}
        onConfirm={() => {
          void guard(() => loopsRepo.remove(loop.id))
          setConfirmLoopDelete(false)
        }}
      />
    </section>
  )
}

/** Placeholder prawej kolumny (ADR-0005); wariant pierwszy-run obiecuje start od dodania wątku (luka #8). */
export function PanelPlaceholder({ firstRun }: { firstRun?: boolean }) {
  return (
    <div className="flex h-full items-center justify-center" aria-label="Brak zaznaczonego wątku">
      <div className="max-w-xs rounded-xl border border-dashed border-border p-8 text-center">
        <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Inbox className="size-5" />
        </span>
        <p className="pt-3 text-sm font-medium">{firstRun ? 'Zacznij od nazwania pierwszego wątku…' : 'Wybierz wątek…'}</p>
        <p className="pt-1 text-xs text-muted-foreground">
          {firstRun
            ? 'Pole po lewej czeka na tytuł — jego działania i cel pojawią się tutaj.'
            : 'Działania i cel zaznaczonego wątku pojawią się tutaj.'}
        </p>
      </div>
    </div>
  )
}

function EmptyActionsHint() {
  return (
    <li className="list-none rounded-lg border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground">
      Wątek bez kroków — dopisz pierwszy poniżej.
    </li>
  )
}
