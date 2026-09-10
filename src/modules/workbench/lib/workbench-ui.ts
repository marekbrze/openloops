import type { LoopAction } from '@/modules/data-layer'

/**
 * Wszystkie pochodne karty wątku z ENTITY_MAP: blocked/liczniki wyliczamy,
 * nie przechowujemy — zero redundancji w bazie.
 */

export type CardStatusView =
  | { kind: 'actions' }
  | { kind: 'waiting-only'; waiting: number }
  | { kind: 'empty' }

/** ADR-0038: karta bez pasa progresu — liczy się tylko etykieta stanu (pusta / czeka / rozpisana). */
export function getCardStatusView(actions: LoopAction[]): CardStatusView {
  if (actions.length === 0) return { kind: 'empty' }
  const myMoves = actions.filter((a) => a.ownerType === 'MyMove')
  if (myMoves.length === 0) return { kind: 'waiting-only', waiting: unfinished(actions).length }
  return { kind: 'actions' }
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
