import type { BaseEntity } from '../../../shared/types'

/** Status cyklu życia wątku: open → closed (zwycięstwo) | abandoned (nie zwycięstwo). */
export type LoopStatus = 'open' | 'closed' | 'abandoned'

/** Typ akcji: mój ruch (liczy się do progresu) albo czekam na kogoś. */
export type ActionOwnerType = 'MyMove' | 'WaitingOn'

/** Rodzaj wpisu dziennika: skończona akcja = małe zwycięstwo, domknięty wątek = większe. */
export type DayEntryKind = 'action-done' | 'loop-closed'

/**
 * Otwarty wątek roboczy — podstawowa jednostka pracy.
 * Cel (`Goal` z ENTITY_MAP.md) jest 1:1 z wątkiem, więc jest przechowywany
 * jako pole `goalText`; UI renderuje go przypięty jako ostatni element listy akcji.
 */
export interface Loop extends BaseEntity {
  title: string
  status: LoopStatus
  /** Ręczny priorytet — kolejność na liście po lewej (drag & drop). */
  sortOrder: number
  /** Cel-definition-of-done: „po czym wiem, że gotowe". */
  goalText: string
  closedAt?: string
  abandonedAt?: string
}

/** Konkretny krok do podjęcia w ramach wątku. */
export interface LoopAction extends BaseEntity {
  loopId: string
  label: string
  ownerType: ActionOwnerType
  /** Data dopytania — tylko dla WaitingOn; po terminie widoczny znacznik przeterminowania. */
  followUpDate?: string
  done: boolean
  doneAt?: string
  /** Ręczna kolejność wykonania — cel zawsze zostaje ostatnim elementem (decyzja UI). */
  sortOrder: number
}

/**
 * Wpis zwycięstwa w dzienniku — powstaje automatycznie przy Toggle Done / Close Loop.
 * Odhaczenie akcji usuwa swój wpis (bilans dnia zawsze pokazuje stan realny).
 */
export interface DayEntry extends BaseEntity {
  kind: DayEntryKind
  loopId: string
  actionId?: string
  /** Snapshot tekstu — historia pozostaje czytelna po edycji/usunięciu źródła. */
  snapshotText: string
  /** Lokalna data zdarzenia w formacie YYYY-MM-DD. */
  dayKey: string
}
