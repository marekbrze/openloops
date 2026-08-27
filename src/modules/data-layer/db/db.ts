import Dexie, { type Table } from 'dexie'
import type { DayEntry, Loop, LoopAction } from '../types'

/**
 * Schemat — encje z docs/ENTITY_MAP.md.
 * Cel jest osadzony w Loop (goalText); DayEntry to append-log zwycięstw.
 */
export class OpenLoopsDB extends Dexie {
  loops!: Table<Loop, string>
  actions!: Table<LoopAction, string>
  dayEntries!: Table<DayEntry, string>

  constructor() {
    super('openloops')
    this.version(1).stores({
      // Indeksy: tylko pola używane do wyszukiwania/sortowania — reszta siedzi w rekordzie.
      loops: 'id, status, sortOrder',
      actions: 'id, loopId, done, [loopId+sortOrder]',
      dayEntries: 'id, dayKey, kind, actionId',
    })
    // v2: moduł tags wycofany (2026-08-27) — `null` kasuje tabelę przy upgrade istniejącej bazy.
    this.version(2).stores({ tags: null })
  }
}

export const db = new OpenLoopsDB()
