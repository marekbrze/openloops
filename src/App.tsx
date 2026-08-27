import { useEffect, useState } from 'react'
import { DevToolbar } from './shared/components/DevToolbar'
import { WorkbenchScreen } from './modules/workbench/components/workbench-screen'
import { JournalPlaceholder } from './modules/journal/components/journal-placeholder'
import { ensureScenarioBootstrapped } from './scenarios/loader'

type ViewId = 'workbench' | 'journal'

const MODULE_TABS: { id: ViewId; label: string }[] = [
  { id: 'workbench', label: 'Workbench' },
  { id: 'journal', label: 'Dziennik' },
]

function App() {
  const [ready, setReady] = useState(false)
  const [view, setView] = useState<ViewId>('workbench')

  // Seed scenariusza przed pierwszym renderem — produkcja startuje zawsze z czystego stanu.
  useEffect(() => {
    let cancelled = false
    ensureScenarioBootstrapped().finally(() => {
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
    }
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
        {!ready ? (
          <p className="p-4 text-sm text-muted-foreground">Ładowanie danych lokalnych…</p>
        ) : view === 'workbench' ? (
          <WorkbenchScreen />
        ) : (
          <JournalPlaceholder />
        )}
      </main>

      <DevToolbar />
    </div>
  )
}

export default App
