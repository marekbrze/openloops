import { BookOpen } from 'lucide-react'
import { dayKey } from '@/modules/data-layer'
import { useTodayEntryCount } from '@/modules/workbench/hooks/use-workbench'

/**
 * Placeholder modułu Dziennik (kolejny etap proto-lofi).
 * Pokazuje już realną liczbę dzisiejszych zwycięstw — pisze je wyłącznie workbench.
 */
export function JournalPlaceholder() {
  const todayWins = useTodayEntryCount(dayKey())

  return (
    <div className="flex h-full items-center justify-center">
      <div className="max-w-md rounded-xl border border-dashed border-border bg-card p-8 text-center">
        <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <BookOpen className="size-5" />
        </span>
        <h1 className="pt-3 text-base font-semibold tracking-tight">Dziennik zwycięstw</h1>
        <p className="pt-2 text-sm text-muted-foreground">
          Moduł czeka na swój prototyp. Dane już żyją: workbench zapisuje dziś{' '}
          <strong className="font-semibold text-foreground">{todayWins}</strong>{' '}
          {pluralize(todayWins)}.
        </p>
        <p className="pt-2 text-xs text-muted-foreground">
          Po odhaczeniu akcji albo domknięciu wątku wróć tutaj — bilans dnia będzie czekał.
        </p>
      </div>
    </div>
  )
}

function pluralize(count: number): string {
  if (count === 1) return 'zwycięstwo'
  const ones = count % 10
  const dozens = count % 100
  if (ones >= 2 && ones <= 4 && !(dozens >= 12 && dozens <= 14)) return 'zwycięstwa'
  return 'zwycięstw'
}
