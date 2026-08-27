import type { DayEntry, Loop, LoopAction, NowItem } from '@/modules/data-layer'

export type ScenarioName = 'empty' | 'minimal' | 'full' | string

/**
 * Dane scenariusza seedują bazę Dexie (IndexedDB).
 * ID fixture'ów są stałe (slugi), żeby akcje/wpisy dziennika mogły się do wątków odwoływać.
 */
export interface ScenarioData {
  loops: Loop[]
  actions: LoopAction[]
  dayEntries: DayEntry[]
  /** Kolejka „Teraz" (ADR-0021) — referencje po actionId akcji z tego samego scenariusza. */
  nowItems: NowItem[]
}

export const EMPTY_DATA: ScenarioData = { loops: [], actions: [], dayEntries: [], nowItems: [] }
