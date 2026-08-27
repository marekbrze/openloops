import { CheckCircle2, Trophy } from 'lucide-react'
import type { DayEntry } from '@/modules/data-layer'
import type { DayGroup } from '../hooks/use-journal'
import { formatDayTitle, formatEntryTime } from '../lib/journal-date'

interface DayCardProps {
  date: Date
  group: DayGroup
  isToday: boolean
}

/** Rodzaj wpisu = język zwycięstw z GLOSSARY: małe (akcja) vs większe (domknięty wątek). */
const KIND_META: Record<DayEntry['kind'], { label: string; Icon: typeof CheckCircle2 }> = {
  'action-done': { label: 'Małe zwycięstwo', Icon: CheckCircle2 },
  'loop-closed': { label: 'Większe zwycięstwo', Icon: Trophy },
}

/**
 * Karta jednego dnia tygodnia. Dni zawsze widoczne — pełna karta ze wpisami albo
 * wygaszony wiersz „Brak zwycięstw”; zero stanów rozwijania (ADR-0016).
 */
export function DayCard({ date, group, isToday }: DayCardProps) {
  const smallWins = group.entries.filter((e) => e.kind === 'action-done').length
  const bigWins = group.entries.length - smallWins

  return (
    <article
      aria-label={formatDayTitle(date)}
      className={`rounded-xl border bg-card p-3 ${isToday ? 'border-primary/50' : 'border-border'}`}
    >
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">{formatDayTitle(date)}</h3>
          {isToday && (
            <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
              dziś
            </span>
          )}
        </div>
        {group.entries.length > 0 && (
          <div className="flex items-center gap-2 text-xs tabular-nums text-muted-foreground">
            <span className="flex items-center gap-1" aria-label={`${smallWins}`}>
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              {smallWins}
            </span>
            <span className="flex items-center gap-1" aria-label={`${bigWins}`}>
              <Trophy className="size-3.5" aria-hidden="true" />
              {bigWins}
            </span>
          </div>
        )}
      </header>

      {group.entries.length === 0 ? (
        <p className="pt-2 text-xs text-muted-foreground/70">Brak zwycięstw</p>
      ) : (
        <ul className="divide-y divide-border/60">
          {group.entries.map((entry) => (
            <EntryRow key={entry.id} entry={entry} />
          ))}
        </ul>
      )}
    </article>
  )
}

function EntryRow({ entry }: { entry: DayEntry }) {
  const meta = KIND_META[entry.kind]
  return (
    <li className="flex items-start gap-2 py-2 first:mt-1">
      <time
        dateTime={entry.createdAt}
        className="w-10 shrink-0 pt-0.5 text-xs tabular-nums text-muted-foreground"
      >
        {formatEntryTime(entry.createdAt)}
      </time>
      <meta.Icon
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <p className="min-w-0 text-sm leading-snug break-words">
        <span className="sr-only">{meta.label}: </span>
        {entry.snapshotText}
      </p>
    </li>
  )
}
