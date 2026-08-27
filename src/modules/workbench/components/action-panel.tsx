import { useState } from 'react'
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
import { actionsRepo, loopsRepo, tagsRepo } from '@/modules/data-layer'
import type { LoopAction } from '@/modules/data-layer'
import { Button } from '@/components/ui/button'
import { SimpleMenu } from '@/shared/components/simple-menu'
import { ConfirmDialog } from '@/shared/components/confirm-dialog'
import { EditableText } from '@/shared/components/editable-text'
import { TagEditor } from './tag-editor'
import { useLoop, useLoopActions, useTags } from '../hooks/use-workbench'
import { ActionAddForm } from './action-add-form'
import { CloseLoopModal } from './close-loop-modal'
import { PinnedGoal } from './pinned-goal'
import { SortableActionRow } from './action-row'

interface ActionPanelProps {
  loopId?: string
}

/**
 * Prawa kolumna workbench: akcje zaznaczonego wątku z przypiętym celem na końcu.
 * Zaznaczenie nieistniejącego wątku (usunięty/domknięty) schodzi automatycznie do placeholda.
 */
export function ActionPanel({ loopId }: ActionPanelProps) {
  const loop = useLoop(loopId)
  const actions = useLoopActions(loopId)
  const tags = useTags()
  const [closeOpen, setCloseOpen] = useState(false)
  const [pendingDeleteAction, setPendingDeleteAction] = useState<LoopAction | undefined>(undefined)
  const [confirmLoopDelete, setConfirmLoopDelete] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  if (!loop) return <PanelPlaceholder />

  /** Reordering nie ma dostępu do celu — SortableContext obejmuje wyłącznie akcje (ADR priority area). */
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const oldIndex = actions.findIndex((a) => a.id === active.id)
    const newIndex = actions.findIndex((a) => a.id === over.id)
    void actionsRepo.reorder(arrayMove(actions, oldIndex, newIndex).map((a) => a.id))
  }

  /** ACTIONS.md: done-akcja znika za potwierdzeniem (traci bieżące zwycięstwo); undone natychmiast. */
  const requestDeleteAction = (action: LoopAction) => {
    if (action.done) setPendingDeleteAction(action)
    else void actionsRepo.remove(action)
  }

  return (
    <section aria-label={`Panel akcji wątku ${loop.title}`} className="flex h-full min-h-0 flex-col">
      <header className="shrink-0 border-b border-border pb-3">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1" data-no-select>
            <EditableText
              value={loop.title}
              onChange={(title) => void loopsRepo.update(loop.id, { title })}
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
              { label: 'Porzuć wątek', onSelect: () => void loopsRepo.abandon(loop.id), destructive: false },
              { label: 'Usuń…', onSelect: () => setConfirmLoopDelete(true), destructive: true },
            ]}
          />
        </div>

        <div className="pt-1.5 pl-1">
          <TagEditor
            tagsPool={tags}
            attachedTagIds={loop.tagIds}
            onAttach={(tag) =>
              void (loop.tagIds.includes(tag.id)
                ? Promise.resolve()
                : loopsRepo.update(loop.id, { tagIds: [...loop.tagIds, tag.id] }))
            }
            onDetach={(tag) => void loopsRepo.update(loop.id, { tagIds: loop.tagIds.filter((t) => t !== tag.id) })}
            onCreateAndAttach={(name) =>
              void tagsRepo.findOrCreate(name).then(async (tag) => {
                if (!loop.tagIds.includes(tag.id)) await loopsRepo.update(loop.id, { tagIds: [...loop.tagIds, tag.id] })
              })
            }
          />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pb-12 pt-3">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={actions.map((a) => a.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-1" aria-label="Działania wątku — ręczna kolejność wykonania">
              {actions.length === 0 ? (
                <EmptyActionsHint />
              ) : (
                actions.map((action) => (
                  <SortableActionRow key={action.id} action={action} onRequestDelete={requestDeleteAction} />
                ))
              )}
            </ul>
          </SortableContext>
        </DndContext>

        {/* Nowe kroki trafiają na koniec listy (repo sortOrder = length) — zawsze tuż nad celem. */}
        <div className="mt-2">
          <ActionAddForm onAdd={(label) => void actionsRepo.add(loop.id, label, 'MyMove')} />
        </div>

        <PinnedGoal goalText={loop.goalText} onUpdate={(goalText) => void loopsRepo.update(loop.id, { goalText })} />
      </div>

      {/* Moment domknięcia (ADR-0001): celebracja z nazwanym wpisem do dziennika. */}
      <CloseLoopModal loop={closeOpen ? loop : null} onClose={() => setCloseOpen(false)} />

      <ConfirmDialog
        open={Boolean(pendingDeleteAction)}
        heading="Usunąć wykonaną akcję?"
        body={`„${pendingDeleteAction?.label ?? ''}” zniknie z listy, a bilans dnia utraci jej dzisiejsze zwycięstwo. Snapshoty z poprzednich dni zostają.`}
        onCancel={() => setPendingDeleteAction(undefined)}
        onConfirm={() => {
          if (pendingDeleteAction) void actionsRepo.remove(pendingDeleteAction)
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
          void loopsRepo.remove(loop.id)
          setConfirmLoopDelete(false)
        }}
      />
    </section>
  )
}

function PanelPlaceholder() {
  return (
    <div className="flex h-full items-center justify-center" aria-label="Brak zaznaczonego wątku">
      <div className="max-w-xs rounded-xl border border-dashed border-border p-8 text-center">
        <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Inbox className="size-5" />
        </span>
        <p className="pt-3 text-sm font-medium">Wybierz wątek…</p>
        <p className="pt-1 text-xs text-muted-foreground">
          Działania i cel zaznaczonego wątku pojawią się tutaj.
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
