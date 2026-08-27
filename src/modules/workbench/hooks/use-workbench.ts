import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/modules/data-layer'
import type { Loop, LoopAction } from '@/modules/data-layer'

/**
 * Żywe zapytania Dexie — każda mutacja repozytorium odświeża UI automatycznie.
 * Kolana/UI nie trzymają lokalnej kopii stanu domenowego.
 */

export function useOpenLoops(): Loop[] | undefined {
  return useLiveQuery(() => db.loops.where('status').equals('open').sortBy('sortOrder'), [])
}

/** Sekcja „Domknięte i porzucone” (ADR-0002) — kolejność wg daty zdarzenia malejąco. */
export function useClosedLoops(): Loop[] | undefined {
  return useLiveQuery(
    async () =>
      [...(await db.loops.where('status').anyOf(['closed', 'abandoned']).toArray())].sort((a, b) =>
        (b.closedAt ?? b.abandonedAt ?? b.updatedAt).localeCompare(a.closedAt ?? a.abandonedAt ?? a.updatedAt),
      ),
    [],
  )
}

export function useLoop(id?: string): Loop | undefined {
  const loop = useLiveQuery(async () => (id ? await db.loops.get(id) : undefined), [id])
  return loop
}

export function useLoopActions(loopId?: string): LoopAction[] {
  const actions = useLiveQuery(
    async () => (loopId ? await db.actions.where('loopId').equals(loopId).sortBy('sortOrder') : []),
    [loopId],
  )
  return actions ?? []
}

/** Akcje wszystkich wątków — źródło pochodnych kart lewej kolumny. */
export function useAllActions(): LoopAction[] {
  const actions = useLiveQuery(() => db.actions.toArray())
  return actions ?? []
}
