import Dexie, { type Table } from 'dexie'
import type { DayEntry, Loop, LoopAction, Tag } from '../types'

/**
 * Schemat v1 — encje z docs/ENTITY_MAP.md.
 * Cel jest osadzony w Loop (goalText); DayEntry to append-log zwycięstw.
 */
export class OpenLoopsDB extends Dexie {
  loops!: Table<Loop, string>
  actions!: Table<LoopAction, string>
  tags!: Table<Tag, string>
  dayEntries!: Table<DayEntry, string>

  constructor() {
    super('openloops')
    this.version(1).stores({
      // Indeksy: tylko pola używane do wyszukiwania/sortowania — reszta siedzi w rekordzie.
      loops: 'id, status, sortOrder',
      actions: 'id, loopId, done, [loopId+sortOrder]',
      tags: 'id, &name',
      dayEntries: 'id, dayKey, kind, actionId',
    })
  }
}

export const db = new OpenLoopsDB()
