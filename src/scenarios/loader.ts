import { db } from '@/modules/data-layer';
import { getScenario } from './index';

const NAME_KEY = '__scenario_name__';
const LOADED_KEY = '__scenario_loaded__';

export function getCurrentScenarioName(): string {
  // Produkcja zawsze startuje z czystym stanem — deweloperskie dane nie przeciekają do UI.
  if (import.meta.env.PROD) return 'empty';
  return localStorage.getItem(NAME_KEY) || 'empty';
}

async function seedDatabase(name: string): Promise<void> {
  const data = getScenario(name);
  await db.transaction('rw', db.loops, db.actions, db.dayEntries, db.nowItems, async () => {
    await Promise.all([db.loops.clear(), db.actions.clear(), db.dayEntries.clear(), db.nowItems.clear()]);
    await db.loops.bulkAdd(data.loops);
    await db.actions.bulkAdd(data.actions);
    await db.dayEntries.bulkAdd(data.dayEntries);
    await db.nowItems.bulkAdd(data.nowItems);
  });
}

/**
 * Przełączenie scenariusza: czyszczenie IndexedDB + zapis fixture'ów + reload.
 * Markery localStorage zostawiamy — tylko one przeżywają przeładowanie strony.
 */
export async function loadScenario(name: string): Promise<void> {
  await seedDatabase(name);
  localStorage.setItem(LOADED_KEY, name);
  localStorage.setItem(NAME_KEY, name);
  window.location.reload();
}

/** Wersja bez reloadu — do Storybook/stage'owania pojedynczych stanów ekranu. */
export async function applyScenarioWithoutReload(name: string): Promise<void> {
  await seedDatabase(name);
  localStorage.setItem(LOADED_KEY, name);
  localStorage.setItem(NAME_KEY, name);
}

/**
 * Bootstrap przy starcie aplikacji: jeśli marker nie zgadza się z żądanym scenariuszem
 * (pierwsze wejście albo zmiana w dev), seeduje bazę przed renderem. Dane tworzone
 * później przez użytkownika przeżywają reloady, dopóki scenariusz nie zostanie zmieniony.
 */
export async function ensureScenarioBootstrapped(): Promise<void> {
  const want = getCurrentScenarioName();
  if (localStorage.getItem(LOADED_KEY) === want) return;
  await seedDatabase(want);
  localStorage.setItem(LOADED_KEY, want);
}
