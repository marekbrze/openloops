import Dexie from 'dexie'
import { db } from '../db/db'
import type { DayEntry, Loop, LoopAction, NowItem } from '../types'
import { generateId } from '../../../shared/types'

/** Lokalna data w formacie YYYY-MM-DD — klucz agregacji dziennika. */
export function dayKey(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const now = () => new Date().toISOString()

/* ---------- loops ---------- */

export const loopsRepo = {
  /** ADR-0003: nowy wątek trafia NA GÓRĘ listy (quick capture — świeży temat widoczny od razu). */
  async add(title: string, goalText = ''): Promise<Loop> {
    const minOrder = await db.loops.orderBy('sortOrder').first()
    const loop: Loop = {
      id: generateId(),
      title,
      status: 'open',
      sortOrder: (minOrder?.sortOrder ?? 1) - 1,
      goalText,
      createdAt: now(),
      updatedAt: now(),
    }
    await db.loops.add(loop)
    return loop
  },
  update(id: string, patch: Partial<Loop>): Promise<void> {
    return db.loops.update(id, { ...patch, updatedAt: now() }).then(() => undefined)
  },
  /** Ręczny priorytet po drag & drop — zapis nowej kolejności wskazanych id. */
  async reorder(orderedIds: string[]): Promise<void> {
    await db.transaction('rw', db.loops, async () => {
      for (let i = 0; i < orderedIds.length; i++) {
        await db.loops.update(orderedIds[i], { sortOrder: i, updatedAt: now() })
      }
    })
  },
  get(id: string): Promise<Loop | undefined> {
    return db.loops.get(id)
  },
  listOpen(): Promise<Loop[]> {
    return db.loops.where('status').equals('open').sortBy('sortOrder')
  },
  /** Sekcja „Domknięte i porzucone” (ADR-0002) — sortowanie wg daty zdarzenia malejąco robi UI. */
  async listByStatuses(statuses: Loop['status'][]): Promise<Loop[]> {
    const found = await db.loops.where('status').anyOf(statuses).toArray()
    return found.sort((a, b) =>
      (b.closedAt ?? b.abandonedAt ?? b.updatedAt).localeCompare(a.closedAt ?? a.abandonedAt ?? a.updatedAt),
    )
  },
  /**
   * Porzucenie celowo nie tworzy wpisu dziennika — nie jest zwycięstwem.
   * Kaskada Teraz (ADR-0021): akcje porzuconego wątku znikają z kolejki.
   */
  async abandon(id: string): Promise<void> {
    await db.transaction('rw', db.loops, db.actions, db.nowItems, async () => {
      const actionIds = (await db.actions.where('loopId').equals(id).toArray()).map((a) => a.id)
      await clearNowItems(actionIds)
      await db.loops.update(id, { status: 'abandoned', abandonedAt: now(), updatedAt: now() })
    })
  },
  /** Reopen wraca na koniec listy otwartej (ADR-0003: przechwycenie ≠ przywrócenie); wpisów dziennika nie rusza. */
  async reopen(id: string): Promise<void> {
    const maxOrder = await db.loops.orderBy('sortOrder').last()
    await db.loops.update(id, {
      status: 'open',
      sortOrder: (maxOrder?.sortOrder ?? -1) + 1,
      closedAt: undefined,
      abandonedAt: undefined,
      updatedAt: now(),
    })
  },
  async remove(id: string): Promise<void> {
    // Twarde usunięcie wątku z akcjami i pozycjami Teraz; wpisy dziennika zostają ze snapshotem tekstu.
    await db.transaction('rw', db.loops, db.actions, db.nowItems, async () => {
      const actionIds = (await db.actions.where('loopId').equals(id).toArray()).map((a) => a.id)
      await clearNowItems(actionIds)
      await db.actions.where('loopId').equals(id).delete()
      await db.loops.delete(id)
    })
  },
}

/* ---------- actions ---------- */

const bySortOrder = (loopId: string) =>
  db.actions
    .where('[loopId+sortOrder]')
    .between([loopId, Dexie.minKey], [loopId, Dexie.maxKey])
    .toArray()

export const actionsRepo = {
  async add(loopId: string, label: string, ownerType: LoopAction['ownerType']): Promise<LoopAction> {
    const existing = await bySortOrder(loopId)
    const action: LoopAction = {
      id: generateId(),
      loopId,
      label,
      ownerType,
      done: false,
      sortOrder: existing.length,
      createdAt: now(),
      updatedAt: now(),
    }
    await db.actions.add(action)
    return action
  },
  update(id: string, patch: Partial<LoopAction>): Promise<void> {
    return db.actions.update(id, { ...patch, updatedAt: now() }).then(() => undefined)
  },
  /**
   * Toggle Done + semantyka zwycięstw: check zapisuje DayEntry ('action-done'),
   * odhaczenie usuwa WSZYSTKIE swoje wpisy (nie tylko dzisiejszy — luka #1 audytu
   * dziennika) — bilans dnia wraca do stanu realnego.
   */
  async toggleDone(action: LoopAction): Promise<void> {
    const today = dayKey()
    const entryId = `${action.id}:${today}`
    await db.transaction('rw', db.actions, db.dayEntries, async () => {
      if (!action.done) {
        const entry: DayEntry = {
          id: entryId,
          kind: 'action-done',
          loopId: action.loopId,
          actionId: action.id,
          snapshotText: action.label,
          dayKey: today,
          createdAt: now(),
          updatedAt: now(),
        }
        await db.actions.update(action.id, { done: true, doneAt: now(), updatedAt: now() })
        await db.dayEntries.put(entry)
      } else {
        await db.actions.update(action.id, { done: false, doneAt: undefined, updatedAt: now() })
        await clearWinEntries(action.id)
      }
    })
  },
  /** Ręczna kolejność wykonania; cel pozostaje przypięty jako ostatni element (poza tą listą). */
  async reorder(orderedIds: string[]): Promise<void> {
    await db.transaction('rw', db.actions, async () => {
      for (let i = 0; i < orderedIds.length; i++) {
        await db.actions.update(orderedIds[i], { sortOrder: i, updatedAt: now() })
      }
    })
  },
  /**
   * Usunięcie akcji: done-akcja traci też bieżące zwycięstwo dnia
   * (akcji nie ma ⇒ nie była wykonana); snapy z poprzednich dni zostają.
   * Kaskada Teraz: rekord kolejki odchodzi razem ze źródłem (ADR-0021).
   */
  async remove(action: LoopAction): Promise<void> {
    await db.transaction('rw', db.actions, db.dayEntries, db.nowItems, async () => {
      await clearNowItems([action.id])
      await db.actions.delete(action.id)
      if (action.done) await clearWinEntries(action.id)
    })
  },
  listForLoop(loopId: string): Promise<LoopAction[]> {
    return bySortOrder(loopId)
  },
}

/**
 * Akcja niezrobiona ⇒ żadnego dnia nie było od niej zwycięstwa: czyszczenie PO INDEKSIE
 * actionId, niezależnie od daty. Poprzednio usuwano wyłącznie wpis dzisiejszej daty,
 * więc cofnięcie odhaczenia następnego dnia zostawiało ghost-wpis i fałszowało bilans
 * dziennika (luka #1 audytu, ADR-0019).
 */
function clearWinEntries(actionId: string): Promise<number> {
  return db.dayEntries.where('actionId').equals(actionId).delete()
}

/* ---------- now items (kolejka „Teraz") ---------- */

/** Deterministyczny klucz pozycji kolejki — jeden rekord na akcję, toggle bez ryzyka duplikatów. */
export const nowItemId = (actionId: string): string => `now:${actionId}`

/**
 * Kaskada ADR-0021: pozycja kolejki nie przeżywa swojego źródła. Wywoływana przy usunięciu
 * akcji oraz przy domknięciu/porzuceniu/usunięciu wątku — akcje nieczynne nie mogą wisieć
 * na ekranie pracy jako duchy.
 */
function clearNowItems(actionIds: string[]): Promise<void> {
  if (actionIds.length === 0) return Promise.resolve()
  return db.nowItems.where('actionId').anyOf(actionIds).delete().then(() => undefined)
}

export const nowRepo = {
  list(): Promise<NowItem[]> {
    return db.nowItems.orderBy('sortOrder').toArray()
  },
  /**
   * Dołączenie akcji do kolejki — idempotentne (deterministyczny klucz), doklejane na KONIEC
   * (ADR-0023): ułożony plan pracy nie traci głowy.
   */
  async add(actionId: string): Promise<void> {
    const item: NowItem = {
      id: nowItemId(actionId),
      actionId,
      sortOrder: 0,
      addedAt: now(),
      createdAt: now(),
      updatedAt: now(),
    }
    await db.transaction('rw', db.nowItems, async () => {
      if (await db.nowItems.get(item.id)) return
      const last = await db.nowItems.orderBy('sortOrder').last()
      item.sortOrder = (last?.sortOrder ?? -1) + 1
      await db.nowItems.put(item)
    })
  },
  removeByActionId(actionId: string): Promise<void> {
    return db.nowItems.delete(nowItemId(actionId)).then(() => undefined)
  },
  /** Masowe zdejmowanie („Zdejmij zrobione") — pojedyncza transakcja zamiast serii kliknięć. */
  removeByActionIds(actionIds: string[]): Promise<void> {
    if (actionIds.length === 0) return Promise.resolve()
    return db.nowItems.where('actionId').anyOf(actionIds).delete().then(() => undefined)
  },
  /** Ręczne ułożenie kolejki — zamówione id pozycji (= `now:${actionId}`) dostają kolejne indeksy. */
  async reorder(orderedIds: string[]): Promise<void> {
    await db.transaction('rw', db.nowItems, async () => {
      for (let i = 0; i < orderedIds.length; i++) {
        await db.nowItems.update(orderedIds[i], { sortOrder: i, updatedAt: now() })
      }
    })
  },
}

/* ---------- day entries (dziennik) ---------- */

export const dayEntriesRepo = {
  listByDay(day: string): Promise<DayEntry[]> {
    return db.dayEntries.where('dayKey').equals(day).sortBy('createdAt')
  },
  /** Bilans tygodnia — klucze dni YYYY-MM-DD dostarcza widok dziennika. */
  listByDays(days: string[]): Promise<DayEntry[]> {
    return db.dayEntries.where('dayKey').anyOf(days).toArray()
  },
}

/**
 * Domknięcie wątku = większe zwycięstwo: wpis 'loop-closed' dla dzisiejszego dnia.
 * Porzucenie (abandon) celowo nie tworzy wpisu — porzucenie nie jest zwycięstwem.
 * Kaskada Teraz (ADR-0021): domknięty wątek zabiera swoje akcje z kolejki.
 */
export async function closeLoopWithWin(loop: Loop): Promise<void> {
  const today = dayKey()
  await db.transaction('rw', db.loops, db.actions, db.dayEntries, db.nowItems, async () => {
    const entry: DayEntry = {
      id: `close:${loop.id}:${today}`,
      kind: 'loop-closed',
      loopId: loop.id,
      snapshotText: loop.title,
      dayKey: today,
      createdAt: now(),
      updatedAt: now(),
    }
    const actionIds = (await db.actions.where('loopId').equals(loop.id).toArray()).map((a) => a.id)
    await clearNowItems(actionIds)
    await db.loops.update(loop.id, { status: 'closed', closedAt: now(), updatedAt: now() })
    await db.dayEntries.put(entry)
  })
}
