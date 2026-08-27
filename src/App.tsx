import { useEffect, useState } from 'react'
import { DevToolbar } from './shared/components/DevToolbar'
import { NowScreen } from './modules/now/components/now-screen'
import { TaskListScreen } from './modules/tasks/components/task-list-screen'
import { WorkbenchScreen } from './modules/workbench/components/workbench-screen'
import { JournalScreen } from './modules/journal/components/journal-screen'
import { AppNotices } from './shared/components/app-notices'
import type { ViewId } from './lib/navigation'
import { ensureScenarioBootstrapped } from './scenarios/loader'

/* ADR-0020: Teraz = lądowanie i główny ekran pracy; workbench schodzi na pozycję narzędzia. */
const MODULE_TABS: { id: ViewId; label: string }[] = [
  { id: 'now', label: 'Teraz' },
  { id: 'tasks', label: 'Zadania' },
  { id: 'workbench', label: 'Workbench' },
  { id: 'journal', label: 'Dziennik' },
]

const BOOT_ERROR_MESSAGE =
  'Nie udało się otworzyć lokalnej bazy danych (IndexedDB). openloops pracuje wyłącznie na pamięci przeglądarki — najczęstsze powody: tryb prywatny, zablokowana pamięć stron albo brak miejsca.'

function App() {
  const [ready, setReady] = useState(false)
  const [bootError, setBootError] = useState<string | null>(null)
  const [view, setView] = useState<ViewId>('now')

  // Seed scenariusza przed pierwszym renderem; porażka otwarcia IndexedDB = widoczny ekran błędu (luka #2).
  useEffect(() => {
    let cancelled = false
    ensureScenarioBootstrapped()
      .then(() => {
        if (!cancelled) setReady(true)
      })
      .catch((error) => {
        console.error('[openloops] bootstrap bazy nie powiódł się', error)
        if (!cancelled) setBootError(BOOT_ERROR_MESSAGE)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Toasty mogą przełączać widok (np. „Otwórz dziennik” po domknięciu wątku).
  useEffect(() => {
    const onNavigate = (event: Event) => setView((event as CustomEvent<ViewId>).detail)
    window.addEventListener('openloops:navigate', onNavigate)
    return () => window.removeEventListener('openloops:navigate', onNavigate)
  }, [])

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      {/* Nawigacja modułów: tobar z zakładkami (decyzja layoutu lofi). */}
      <header className="flex h-12 shrink-0 items-center gap-6 border-b border-border bg-background px-4">
        <span className="text-sm font-bold tracking-tight">openloops</span>
        <nav aria-label="Moduły aplikacji">
          <ul className="flex items-center gap-1">
            {MODULE_TABS.map((tab) => (
              <li key={tab.id}>
                <button
                  type="button"
                  onClick={() => setView(tab.id)}
                  aria-current={view === tab.id ? 'page' : undefined}
                  className={
                    view === tab.id
                      ? '-mb-px border-b-2 border-primary px-2 pb-1 pt-0.5 text-sm font-medium text-primary focus-visible:ring-2 focus-visible:ring-ring'
                      : '-mb-px border-b-2 border-transparent px-2 pb-1 pt-0.5 text-sm text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring'
                  }
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="min-h-0 flex-1 p-4">
        {bootError ? (
          <div role="alert" className="mx-auto mt-10 max-w-lg rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-center">
            <h1 className="text-base font-semibold">Aplikacja nie może wystartować</h1>
            <p className="pt-2 text-sm text-muted-foreground">{bootError}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"
            >
              Spróbuj ponownie
            </button>
          </div>
        ) : !ready ? (
          <p className="p-4 text-sm text-muted-foreground">Ładowanie danych lokalnych…</p>
        ) : view === 'now' ? (
          <NowScreen />
        ) : view === 'tasks' ? (
          <TaskListScreen />
        ) : view === 'workbench' ? (
          <WorkbenchScreen />
        ) : (
          <JournalScreen />
        )}
      </main>

      <AppNotices />
      <DevToolbar />
    </div>
  )
}

export default App
