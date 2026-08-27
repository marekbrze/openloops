import { useMemo, useState } from 'react'
import { useJournalWeek } from '../hooks/use-journal'
import { addWeeks, formatWeekTitle, startOfWeek, toDayKey, weekDates } from '../lib/journal-date'
import { WeekNavigator } from './week-navigator'
import { WeekBalanceCard } from './week-balance'
import { DayCard } from './day-card'

/**
 * Ekran Dziennika (ADR-0013..0017): nawigacja po tygodniach bez wchodzenia w przyszłość,
 * uczciwy bilans zawsze na górze i siedem płaskich dni bez zwijania.
 */
export function JournalScreen() {
  const [monday, setMonday] = useState(() => startOfWeek(new Date()))
  const days = useMemo(() => weekDates(monday), [monday])
  const dayKeys = useMemo(() => days.map(toDayKey), [days])
  const { grouped, balance } = useJournalWeek(dayKeys)

  // Teraźniejszość liczy się per render — przekroczenie północy w trakcie sesji odświeża znacznik.
  const isCurrentWeek = startOfWeek(new Date()).getTime() === monday.getTime()
  const todayKey = toDayKey(new Date())

  return (
    <div className="mx-auto flex h-full min-h-0 max-w-2xl flex-col gap-4 overflow-y-auto px-1 pb-8">
      <WeekNavigator
        title={formatWeekTitle(monday)}
        isCurrentWeek={isCurrentWeek}
        onPreviousWeek={() => setMonday((current) => addWeeks(current, -1))}
        onNextWeek={() => setMonday((current) => addWeeks(current, 1))}
        onToday={() => setMonday(startOfWeek(new Date()))}
      />

      {balance ? (
        <WeekBalanceCard {...balance} />
      ) : (
        <div aria-hidden="true" className="animate-pulse rounded-xl border border-border bg-card p-4">
          <div className="h-3.5 w-36 rounded-full bg-muted" />
          <div className="mt-3 h-8 w-12 rounded bg-muted" />
        </div>
      )}

      {!grouped ? (
        <LoadingDays />
      ) : (
        <ol aria-label={`Dni tygodnia ${formatWeekTitle(monday)}`} className="flex flex-col gap-2">
          {days.map((date, index) => (
            <li key={grouped[index].dayKey}>
              <DayCard date={date} group={grouped[index]} isToday={toDayKey(date) === todayKey} />
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

function LoadingDays() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-2">
      {Array.from({ length: 7 }, (_, index) => (
        <div key={index} className="animate-pulse rounded-xl border border-border bg-card p-3">
          <div className="h-3.5 w-40 rounded-full bg-muted" />
          <div className="mt-2 h-3 w-24 rounded-full bg-muted" />
        </div>
      ))}
    </div>
  )
}
