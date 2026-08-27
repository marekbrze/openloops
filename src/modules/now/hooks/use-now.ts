import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/modules/data-layer'
import type { Loop, LoopAction, NowItem } from '@/modules/data-layer'

/**
 * Kolejka „Teraz" żyje na danych źródłowych (ADR-0021): pozycja trzyma tylko actionId,
 * więc kwerenda dokleja akcje i wątki w locie. Mutacje przechodzą przez `nowRepo` —
 * liveQuery odświeża ekran bez lokalnych kopii stanu.
 */

export interface NowRow {
  item: NowItem
  action: LoopAction
  loop: Loop
}

/** Sentinel porażki odczytu — rozróżnia ładowanie od błędu bazy (konwencja dziennika). */
export const READ_ERROR = Symbol('now-read-error')
type NowRead = NowRow[] | typeof READ_ERROR

/**
 * Join trzech tabel + filtr obronny: kaskady ADR-0021 czyszczą przy usuwaniu/domknięciu,
 * a ten filtr gwarantuje, że nawet osierocony rekord nie zawiesi się na ekranie jako duch.
 */
async function joinQueue(): Promise<NowRead> {
  const [items, actions, loops] = await Promise.all([
    db.nowItems.orderBy('sortOrder').toArray(),
    db.actions.toArray(),
    db.loops.toArray(),
  ])
  const actionsById = new Map(actions.map((action) => [action.id, action]))
  const openLoopsById = new Map(
    loops.filter((loop) => loop.status === 'open').map((loop) => [loop.id, loop]),
  )
  const rows: NowRow[] = []
  for (const item of items) {
    const action = actionsById.get(item.actionId)
    const loop = action ? openLoopsById.get(action.loopId) : undefined
    if (!action || !loop) continue
    rows.push({ item, action, loop })
  }
  return rows.sort((a, b) => a.item.sortOrder - b.item.sortOrder || a.item.id.localeCompare(b.item.id))
}

function useQueueRows(retryToken: number): NowRead | undefined {
  return useLiveQuery(
    async () => {
      try {
        return await joinQueue()
      } catch (error) {
        console.error('[openloops] odczyt kolejki Teraz nie powiódł się', error)
        return READ_ERROR
      }
    },
    [retryToken],
  )
}

/** Stan głównego ekranu: wiersze kolejki albo karta błędu; `loading` tylko na pierwszym renderze. */
export interface NowQueueState {
  rows?: NowRow[]
  readFailed: boolean
  loading: boolean
}

export function useNowQueue(retryToken = 0): NowQueueState {
  const rows = useQueueRows(retryToken)
  const [state, setState] = useState<NowQueueState>({ readFailed: false, loading: true })

  // Leniwy efekt jak w dzienniku: między mutacją a odpowiedzią liveQuery stare dane zostają na ekranie.
  useEffect(() => {
    if (rows === undefined) return
    if (rows === READ_ERROR) {
      setState({ readFailed: true, loading: false })
      return
    }
    setState({ rows, readFailed: false, loading: false })
  }, [rows])

  return state
}

/**
 * Zbiór actionId wybranych do Teraz — jedna kwerenda zasila wszystkie przełączniki naraz
 * (modal Zadań i panel workbench). Porażka odczytu = READ_ERROR zamiast wiecznego
 * `undefined` (luka #3 audytu Teraz): retry-token odgrzewa kwerendę razem z retry ekranu.
 */
export function usePickedActionIds(retryToken = 0): Set<string> | typeof READ_ERROR | undefined {
  return useLiveQuery(
    async () => {
      try {
        return new Set((await db.nowItems.toArray()).map((item) => item.actionId))
      } catch (error) {
        console.error('[openloops] odczyt wyboru Teraz nie powiódł się', error)
        return READ_ERROR
      }
    },
    [retryToken],
  )
}

/**
 * Liczba otwartych wątków — decyduje o wariancie stanu pustego ekranu Teraz (świat vs.
 * brak wyboru). Porażka odczytu = READ_ERROR (luka #1: bez niej EmptyQueue zgadywałaby).
 */
export function useOpenLoopCount(retryToken = 0): number | typeof READ_ERROR | undefined {
  return useLiveQuery(
    async () => {
      try {
        return await db.loops.where('status').equals('open').count()
      } catch (error) {
        console.error('[openloops] odczyt liczby otwartych wątków nie powiódł się', error)
        return READ_ERROR
      }
    },
    [retryToken],
  )
}
