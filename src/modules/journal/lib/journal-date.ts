/**
 * Matematyka tygodnia i formatowanie po polsku (ADR-0014).
 * Wszystko liczone w czasie lokalnym; klucze dni zgodne z konwencją data-layer (`dayKey()`).
 */

const pad2 = (n: number): string => String(n).padStart(2, '0')

/** Lokalny klucz dnia YYYY-MM-DD — klucz agregacji dziennika. */
export function toDayKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

/** Poniedziałek tygodnia danej daty, godzina 00:00 czasu lokalnego (tydzień pon–nd). */
export function startOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const shiftToMonday = d.getDay() === 0 ? -6 : 1 - d.getDay()
  d.setDate(d.getDate() + shiftToMonday)
  return d
}

export function addWeeks(anchor: Date, weeks: number): Date {
  const d = new Date(anchor)
  d.setDate(d.getDate() + weeks * 7)
  return d
}

/** Siedem dat tygodnia pon→nd; kotwica może leżeć gdziekolwiek w tygodniu. */
export function weekDates(anchor: Date): Date[] {
  const monday = startOfWeek(anchor)
  return Array.from({ length: 7 }, (_, index) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + index)
    return d
  })
}

const weekdayLong = new Intl.DateTimeFormat('pl-PL', { weekday: 'long' })
const monthLong = new Intl.DateTimeFormat('pl-PL', { month: 'long' })
const timeHM = new Intl.DateTimeFormat('pl-PL', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

/** „Poniedziałek, 24 sierpnia”. */
export function formatDayTitle(date: Date): string {
  return `${capitalize(weekdayLong.format(date))}, ${date.getDate()} ${monthLong.format(date)}`
}

/**
 * Nagłówek zakresu tygodnia:
 * „24–30 sierpnia 2026” · „31 sierpnia – 6 września 2026” · „29 grudnia 2025 – 4 stycznia 2026”.
 */
export function formatWeekTitle(anchor: Date): string {
  const dates = weekDates(anchor)
  const first = dates[0]
  const last = dates[6]
  const sameMonth = first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear()
  const sameYear = first.getFullYear() === last.getFullYear()
  if (sameMonth) return `${first.getDate()}–${last.getDate()} ${monthLong.format(last)} ${last.getFullYear()}`
  if (sameYear) {
    return `${first.getDate()} ${monthLong.format(first)} – ${last.getDate()} ${monthLong.format(last)} ${last.getFullYear()}`
  }
  return `${first.getDate()} ${monthLong.format(first)} ${first.getFullYear()} – ${last.getDate()} ${monthLong.format(last)} ${last.getFullYear()}`
}

/** Godzina wpisu „14:05”. */
export function formatEntryTime(createdAtIso: string): string {
  return timeHM.format(new Date(createdAtIso))
}

function capitalize(text: string): string {
  return text.charAt(0).toLocaleUpperCase('pl-PL') + text.slice(1)
}
