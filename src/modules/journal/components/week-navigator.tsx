import { ChevronLeft, ChevronRight } from 'lucide-react'

interface WeekNavigatorProps {
  title: string
  /** Wyświetlany tydzień jest bieżącym → → i „Dziś" nieaktywne (ADR-0015). */
  isCurrentWeek: boolean
  onPreviousWeek(): void
  onNextWeek(): void
  onToday(): void
}

const navButton =
  'rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40'

/** Nagłówek widoku: zakres dat z nawigacją ← / → / „Dziś". Zmiana zakresu ogłaszana przez aria-live. */
export function WeekNavigator({ title, isCurrentWeek, onPreviousWeek, onNextWeek, onToday }: WeekNavigatorProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div role="group" aria-label="Nawigacja po tygodniach" className="flex items-center gap-1">
        <button type="button" onClick={onPreviousWeek} aria-label="Poprzedni tydzień" className={navButton}>
          <ChevronLeft className="size-5" />
        </button>
        <h1 aria-live="polite" className="min-w-[16ch] text-center text-lg font-semibold tracking-tight">
          {title}
        </h1>
        <button
          type="button"
          onClick={onNextWeek}
          aria-label="Następny tydzień"
          disabled={isCurrentWeek}
          className={navButton}
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
      <button
        type="button"
        onClick={onToday}
        disabled={isCurrentWeek}
        className="rounded-lg border border-border px-2.5 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
      >
        Dziś
      </button>
    </div>
  )
}
