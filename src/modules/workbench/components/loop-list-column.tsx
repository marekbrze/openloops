import { useMemo, useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { dayKey, loopsRepo } from '@/modules/data-layer'
import type { Loop, LoopAction } from '@/modules/data-layer'
import { ConfirmDialog } from '@/shared/components/confirm-dialog'
import { SkeletonCards } from '@/shared/components/skeleton-cards'
import { guard } from '@/shared/lib/mutations'
import { plDndAccessibility } from '@/shared/lib/pl-dnd'
import { useAllActions, useClosedLoops, useOpenLoops } from '../hooks/use-workbench'
import { AddLoopForm } from './add-loop-form'
import { ClosedLoopsSection } from './closed-loops-section'
import { LoopCard, draggingStyle } from './loop-card'

interface LoopListColumnProps {
  selectedId?: string
  onSelectLoop: (id: string | undefined) => void
}

/** Lewa kolumna workbench: quick capture + priorytetyzowana lista otwartych + sekcja zamkniętych. */
export function LoopListColumn({ selectedId, onSelectLoop }: LoopListColumnProps) {
  const openLoops = useOpenLoops()
  const closedLoops = useClosedLoops()
  const allActions = useAllActions()
  const [pendingDelete, setPendingDelete] = useState<Loop | undefined>(undefined)

  /** Pochodne kart (progres/czeka/po terminie) liczone z pełnej puli akcji — jedna kwerenda wystarczy. */
  const actionsByLoop = useMemo(() => {
    const map = new Map<string, LoopAction[]>()
    for (const action of allActions) {
      const bucket = map.get(action.loopId)
      if (bucket) bucket.push(action)
      else map.set(action.loopId, [action])
    }
    return map
  }, [allActions])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id || !openLoops) return
    const oldIndex = openLoops.findIndex((l) => l.id === active.id)
    const newIndex = openLoops.findIndex((l) => l.id === over.id)
    void guard(() => loopsRepo.reorder(arrayMove(openLoops, oldIndex, newIndex).map((l) => l.id)))
  }

  return (
    <section aria-label="Lista wątków" className="flex h-full min-h-0 flex-col">
      <header className="mb-2 flex items-baseline justify-between px-1">
        <h2 className="text-sm font-semibold tracking-tight">Wątki otwarte</h2>
        <span className="text-xs text-muted-foreground">{(openLoops ?? []).length}</span>
      </header>

      {/* ADR-0004: inline form nad listą; nowy wątek auto-zaznaczony (ADR-0003/flow przechwycenia). */}
      <AddLoopForm focusOnMount={(openLoops ?? []).length === 0} onAdded={(id) => onSelectLoop(id)} />

      <div className="mt-2 min-h-0 flex-1 overflow-y-auto pb-12">
        {!openLoops ? (
          <SkeletonCards />
        ) : openLoops.length === 0 && (closedLoops ?? []).length === 0 ? (
          <EmptyListHint />
        ) : openLoops.length === 0 ? (
          <p className="mt-2 rounded-lg border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground">
            Brak otwartych wątków. Dobry moment na przechwycenie nowego.
          </p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} accessibility={plDndAccessibility}>
            <SortableContext items={openLoops.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              <ul className="space-y-2" aria-label="Otwarte wątki — ręczny priorytet">
                {openLoops.map((loop) => (
                  <SortableLoopItem
                    key={loop.id}
                    loop={loop}
                    actions={actionsByLoop.get(loop.id) ?? []}
                    selected={selectedId === loop.id}
                    onSelect={() => onSelectLoop(loop.id)}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}

        <ClosedLoopsSection
          loops={closedLoops ?? []}
          onRequestDelete={(loop) => setPendingDelete(loop)}
          onReopen={(loop) => void guard(() => loopsRepo.reopen(loop.id))}
        />
      </div>

      {/* Twarde usunięcie zawsze za potwierdzeniem — wpisy dziennika zostają ze snapshotem. */}
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        heading="Usunąć wątek?"
        body={`„${pendingDelete?.title ?? ''}” zniknie razem z akcjami i celem. Wpisy dziennika zostają — mają snapshot tekstu.`}
        confirmLabel="Usuń bezpowrotnie"
        onCancel={() => setPendingDelete(undefined)}
        onConfirm={() => {
          if (!pendingDelete) return
          void guard(() => loopsRepo.remove(pendingDelete.id))
          if (selectedId === pendingDelete.id) onSelectLoop(undefined)
          setPendingDelete(undefined)
        }}
      />
    </section>
  )
}

function SortableLoopItem({
  loop,
  actions,
  selected,
  onSelect,
}: {
  loop: Loop
  actions: LoopAction[]
  selected: boolean
  onSelect: () => void
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition } = useSortable({
    id: loop.id,
  })

  return (
    <li ref={setNodeRef} style={{ ...draggingStyle(transform ? CSS.Transform.toString(transform) : undefined), transition }}>
      <LoopCard
        loop={loop}
        actions={actions}
        selected={selected}
        todayKey={dayKey()}
        onSelect={onSelect}
        handleRef={setActivatorNodeRef}
        attributes={attributes as unknown as Record<string, unknown>}
        listeners={listeners as unknown as Record<string, unknown> | undefined}
      />
    </li>
  )
}

function EmptyListHint() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center">
      <p className="text-sm font-medium">Czysto przed tobą.</p>
      <p className="pt-1 text-xs text-muted-foreground">
        Nazwij pierwszy otwarty wątek w polu powyżej — zaczyna się od tytułu, cel dopiszesz później.
      </p>
    </div>
  )
}
