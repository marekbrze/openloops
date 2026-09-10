import type { LoopAction } from '@/modules/data-layer'

/**
 * Wszystkie pochodne karty wątku z ENTITY_MAP: blocked/liczniki wyliczamy,
 * nie przechowujemy — zero redundancji w bazie.
 */

export type CardStatusView =
  | { kind: 'counts'; wins: number; open: number }
  | { kind: 'empty' }

/**
 * ADR-0038 → ADR-0041: karta bez pasa progresu — zamiast niego licznik per wątek:
 * zwycięstwa (zrobione akcje obu typów, jak w dzienniku) i otwarte zadania.
 */
export function getCardStatusView(actions: LoopAction[]): CardStatusView {
  if (actions.length === 0) return { kind: 'empty' }
  const wins = actions.filter((a) => a.done).length
  return { kind: 'counts', wins, open: actions.length - wins }
}

/** Wątek jest zablokowany na innych, gdy ma ≥1 niezakończoną akcję WaitingOn. */
function unfinished(actions: LoopAction[]): LoopAction[] {
  return actions.filter((a) => a.ownerType === 'WaitingOn' && !a.done)
}

export function hasWaitingOn(actions: LoopAction[]): boolean {
  return unfinished(actions).length > 0
}

/** „N po terminie” — wyłącznie niezakończone akcje, które *mają* datę dopytania wcześniejszą od dziś. */
export function overdueCount(actions: LoopAction[], todayKey: string): number {
  return unfinished(actions).filter((a) => Boolean(a.followUpDate) && a.followUpDate! < todayKey).length
}
