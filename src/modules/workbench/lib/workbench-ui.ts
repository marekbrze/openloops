import type { LoopAction } from '@/modules/data-layer'

/**
 * Wszystkie pochodne karty wątku z ENTITY_MAP: blocked/liczniki wyliczamy,
 * nie przechowujemy — zero redundancji w bazie.
 */

export type ProgressView =
  | { kind: 'bar'; done: number; total: number }
  | { kind: 'waiting-only'; waiting: number }
  | { kind: 'empty' }

/** ADR-0006: bar istnieje tylko przy jakichkolwiek akcjach „mój ruch” — liczone done/total tego typu. */
export function getProgressView(actions: LoopAction[]): ProgressView {
  const myMoves = actions.filter((a) => a.ownerType === 'MyMove')
  if (myMoves.length === 0) {
    return actions.length === 0
      ? { kind: 'empty' }
      : { kind: 'waiting-only', waiting: unfinished(actions).length }
  }
  return { kind: 'bar', done: myMoves.filter((a) => a.done).length, total: myMoves.length }
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
