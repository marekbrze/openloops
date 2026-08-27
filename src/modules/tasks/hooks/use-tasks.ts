import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/modules/data-layer'
import type { Loop, LoopAction } from '@/modules/data-layer'

/**
 * Katalog wszystkich zadań (ADR-0022): tylko odczyt źródła — akcje otwartych wątków
 * pogrupowane po porządku z lewej kolumny workbench. Edycja i wybór dzieją się gdzie indziej;
 * ten hook wyłącznie porządkuje widok.
 */

export interface TaskGroup {
  loop: Loop
  /** Akcje wątku w ręcznej kolejności wykonania — bez przypiętego celu (cel nie jest zadaniem). */
  actions: LoopAction[]
}

/** Sentinel porażki odczytu — rozróżnia ładowanie od błędu bazy (konwencja dziennika). */
const READ_ERROR = Symbol('tasks-read-error')
type CatalogRead = TaskGroup[] | typeof READ_ERROR

function readCatalog(): Promise<CatalogRead> {
  try {
    return (async () => {
      const [loops, actions] = await Promise.all([
        db.loops.where('status').equals('open').sortBy('sortOrder'),
        db.actions.toArray(),
      ])
      const byLoopId = new Map<string, LoopAction[]>()
      for (const action of actions) {
        const bucket = byLoopId.get(action.loopId)
        if (bucket) bucket.push(action)
        else byLoopId.set(action.loopId, [action])
      }
      return loops.map((loop) => ({
        loop,
        actions: (byLoopId.get(loop.id) ?? []).sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id)),
      }))
    })()
  } catch (error) {
    console.error('[openloops] odczyt katalogu zadań nie powiódł się', error)
    return Promise.resolve(READ_ERROR)
  }
}

/** Stan katalogu: grupy albo karta błędu; `loading` tylko na pierwszym renderze. */
export interface TaskCatalogState {
  groups?: TaskGroup[]
  readFailed: boolean
  loading: boolean
}

export function useTaskCatalog(retryToken = 0): TaskCatalogState {
  const groups = useLiveQuery(
    async () => {
      try {
        return await readCatalog()
      } catch (error) {
        console.error('[openloops] odczyt katalogu zadań nie powiódł się', error)
        return READ_ERROR
      }
    },
    [retryToken],
  )
  const [state, setState] = useState<TaskCatalogState>({ readFailed: false, loading: true })

  // Leniwy efekt jak w dzienniku: dane zostają na ekranie do czasu odpowiedzi liveQuery.
  useEffect(() => {
    if (groups === undefined) return
    if (groups === READ_ERROR) {
      setState({ readFailed: true, loading: false })
      return
    }
    setState({ groups, readFailed: false, loading: false })
  }, [groups])

  return state
}
