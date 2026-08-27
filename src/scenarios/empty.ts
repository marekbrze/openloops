import type { ScenarioData } from './types'
import { EMPTY_DATA } from './types'

/** Czysty stan zerowy — pierwsze uruchomienie / produkcja. */
export function emptyScenario(): ScenarioData {
  return EMPTY_DATA
}
