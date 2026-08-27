import { useEffect, useState } from 'react'
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
 * Sentinel porażki odczytu (luka #2 audytu) — rozróżnia „jeszcze ładuje”
 * od „baza odpowiedziała błędem”; ten drugi stan ma własną kartę z retry.
 */
const READ_ERROR = Symbol('journal-read-error')
type JournalRead = DayEntry[] | typeof READ_ERROR

/**
 * Wpisy dla kluczy dni tygodnia. Zależność to joined-string kluczy (+ token retry
 * z karty błędu) — chroni liveQuery przed fluktuacją referencji tablicy przy renderze.
 */
function useWeekEntries(dayKeys: string[], retryToken: number): JournalRead | undefined {
  const keys = dayKeys.join(',')
  return useLiveQuery(
    async () => {
      try {
        return await db.dayEntries.where('dayKey').anyOf(dayKeys).toArray()
      } catch (error) {
        console.error('[openloops] odczyt wpisów dziennika nie powiódł się', error)
        return READ_ERROR
      }
    },
    [keys, retryToken],
  )
}

/** Stan widoku tygodnia: dane albo karta błędu; `loading` tylko przy pierwszym renderze. */
export interface JournalWeekState {
  grouped?: DayGroup[]
  balance?: WeekBalance
  readFailed: boolean
  loading: boolean
}

export function useJournalWeek(dayKeys: string[], retryToken = 0): JournalWeekState {
  const entries = useWeekEntries(dayKeys, retryToken)
  const [state, setState] = useState<JournalWeekState>({ readFailed: false, loading: true })

  // Leniwy efekt zamiast liczenia w renderze: między przełączeniem tygodnia a odpowiedzią
  // liveQuery poprzednie dane zostają na ekranie (luka #5 — bez błysku szkieletu).
  useEffect(() => {
    if (entries === undefined) return
    if (entries === READ_ERROR) {
      setState({ readFailed: true, loading: false })
      return
    }
    setState({
      grouped: groupByDay(entries, dayKeys),
      balance: weekBalance(entries),
      readFailed: false,
      loading: false,
    })
  }, [entries, dayKeys])

  return state
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
