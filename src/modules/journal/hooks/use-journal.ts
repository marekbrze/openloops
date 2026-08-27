import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/modules/data-layer'
import type { DayEntry } from '@/modules/data-layer'

/**
 * Dziennik jest wyłącznie czytelnikiem (ADR-0013) — hook tylko odczytuje;
 * żywe zapytanie Dexie odświeża bilans natychmiast po każdej mutacji z workbencha.
 */

export interface WeekBalance {
  /** Małe zwycięstwa — skończone akcje (`action-done`). */
  smallWins: number
  /** Większe zwycięstwa — domknięte wątki (`loop-closed`). */
  bigWins: number
}

export interface DayGroup {
  dayKey: string
  entries: DayEntry[]
}

/**
 * Wpisy dla kluczy dni tygodnia. Zależność to joined-string kluczy —
 * chroni liveQuery przed fluktuacją referencji tablicy przy każdym renderze.
 */
export function useWeekEntries(dayKeys: string[]): DayEntry[] | undefined {
  const keys = dayKeys.join(',')
  return useLiveQuery(() => db.dayEntries.where('dayKey').anyOf(dayKeys).toArray(), [keys])
}

/**
 * Grupowanie wpisów po dniach w kolejności kalendarzowej.
 * Sortowanie stabilne: `createdAt`, tie-breaker po `id` — godziny nie przeskakują (spec).
 */
export function groupByDay(entries: DayEntry[], dayKeys: string[]): DayGroup[] {
  const byKey = new Map<string, DayEntry[]>(dayKeys.map((dayKey) => [dayKey, []]))
  const sorted = [...entries].sort(
    (a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id),
  )
  for (const entry of sorted) byKey.get(entry.dayKey)?.push(entry)
  return dayKeys.map((dayKey) => ({ dayKey, entries: byKey.get(dayKey) ?? [] }))
}

export function weekBalance(entries: DayEntry[]): WeekBalance {
  const balance: WeekBalance = { smallWins: 0, bigWins: 0 }
  for (const entry of entries) {
    if (entry.kind === 'action-done') balance.smallWins += 1
    else if (entry.kind === 'loop-closed') balance.bigWins += 1
  }
  return balance
}

/** Grupowanie+bilans memoizowane jednym wywołaniem — dane tej samej paczki liveQuery. */
export function useJournalWeek(dayKeys: string[]): { grouped?: DayGroup[]; balance?: WeekBalance } {
  const entries = useWeekEntries(dayKeys)
  return useMemo(
    () =>
      entries
        ? { grouped: groupByDay(entries, dayKeys), balance: weekBalance(entries) }
        : {},
    [entries, dayKeys],
  )
}
