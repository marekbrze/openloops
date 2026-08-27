import type { DayEntry, Loop, LoopAction, Tag } from '@/modules/data-layer'

export type ScenarioName = 'empty' | 'minimal' | 'full' | string

/**
 * Dane scenariusza seedują bazę Dexie (IndexedDB).
 * ID fixture'ów są stałe (slugi), żeby akcje/wpisy dziennika mogły się do wątków odwoływać.
 */
export interface ScenarioData {
  loops: Loop[]
  actions: LoopAction[]
  tags: Tag[]
  dayEntries: DayEntry[]
}

export const EMPTY_DATA: ScenarioData = { loops: [], actions: [], tags: [], dayEntries: [] }
