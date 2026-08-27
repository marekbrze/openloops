import { useEffect, useMemo, useRef, useState } from 'react'
import { useJournalWeek } from '../hooks/use-journal'
import { addWeeks, formatWeekTitle, startOfWeek, toDayKey, weekDates } from '../lib/journal-date'
import { WeekNavigator } from './week-navigator'
import { WeekBalanceCard } from './week-balance'
import { DayCard } from './day-card'
import { JournalReadError } from './journal-read-error'

/**
 * Ekran Dziennika (ADR-0013..0017): nawigacja po tygodniach bez wchodzenia w przyszłość,
 * uczciwy bilans zawsze na górze i siedem płaskich dni bez zwijania.
 * Porażka odczytu ma kartę z retry (luka #2), nie wieczny szkielet.
 */
export function JournalScreen() {
  const [monday, setMonday] = useState(() => startOfWeek(new Date()))
  const [readRetry, setReadRetry] = useState(0)
  const days = useMemo(() => weekDates(monday), [monday])
  const dayKeys = useMemo(() => days.map(toDayKey), [days])
  const { grouped, balance, readFailed, loading } = useJournalWeek(dayKeys, readRetry)

  // Świadoma nawigacja użytkownika blokuje auto-resync — wracamy tylko przy powrocie na „Dziś”.
  const manualNavRef = useRef(false)

  // Sesja przetrwająca zmianę daty (luka #6): gdy karta odzyskuje widoczność,
  // kotwica „bieżącego tygodnia” dogania dzisiejszą datę — bez ruszania tygodnia przeglądanego celowo.
  useEffect(() => {
    const resync = () => {
      if (document.visibilityState !== 'visible') return
      if (!manualNavRef.current) setMonday(startOfWeek(new Date()))
    }
    document.addEventListener('visibilitychange', resync)
    window.addEventListener('focus', resync)
    return () => {
      document.removeEventListener('visibilitychange', resync)
      window.removeEventListener('focus', resync)
    }
  }, [])

  // Teraźniejszość liczy się per render — przekroczenie północy w trakcie sesji odświeża znacznik.
  const isCurrentWeek = startOfWeek(new Date()).getTime() === monday.getTime()
  const todayKey = toDayKey(new Date())

  return (
    <div className="mx-auto flex h-full min-h-0 max-w-2xl flex-col gap-4 overflow-y-auto px-1 pb-8">
      <WeekNavigator
        title={formatWeekTitle(monday)}
        isCurrentWeek={isCurrentWeek}
        onPreviousWeek={() => {
          manualNavRef.current = true
          setMonday((current) => addWeeks(current, -1))
        }}
        onNextWeek={() => {
          manualNavRef.current = true
          setMonday((current) => addWeeks(current, 1))
        }}
        onToday={() => {
          manualNavRef.current = false
          setMonday(startOfWeek(new Date()))
        }}
      />

      {readFailed ? (
        <JournalReadError onRetry={() => setReadRetry((token) => token + 1)} />
      ) : (
        <>
          {balance ? (
            <WeekBalanceCard {...balance} />
          ) : (
            <div aria-hidden="true" className="animate-pulse rounded-xl border border-border bg-card p-4">
              <div className="h-3.5 w-36 rounded-full bg-muted" />
              <div className="mt-3 h-8 w-12 rounded bg-muted" />
            </div>
          )}

          {!grouped && loading ? (
            <LoadingDays />
          ) : (
            grouped && (
              <ol aria-label={`Dni tygodnia ${formatWeekTitle(monday)}`} className="flex flex-col gap-2">
                {days.map((date, index) => (
                  <li key={grouped[index].dayKey}>
                    <DayCard date={date} group={grouped[index]} isToday={toDayKey(date) === todayKey} />
                  </li>
                ))}
              </ol>
            )
          )}
        </>
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
