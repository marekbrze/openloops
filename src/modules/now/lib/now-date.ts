/**
 * Formatowanie daty i zegara ekranu Teraz (ADR-0020) — wszystko w czasie lokalnym,
 * spójnie z kluczami dni data-layer (`dayKey()`).
 */

/* Jeden formatter dla dnia+miesiąca: pl-PL odmienia miesiąc do dopełniacza („27 sierpnia”)
 * tylko przy koniunkcji — osobne formatowanie dałoby błędną formę mianownika („27 sierpień”). */
const fullDate = new Intl.DateTimeFormat('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })
const timeHM = new Intl.DateTimeFormat('pl-PL', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

/** „Czwartek, 27 sierpnia” — poranne powitanie głównego ekranu pracy. */
export function formatTodayTitle(date: Date): string {
  const formatted = fullDate.format(date)
  return formatted.charAt(0).toLocaleUpperCase('pl-PL') + formatted.slice(1)
}

/** „14:05”. */
export function formatClockTime(date: Date): string {
  return timeHM.format(date)
}

/**
 * Meta kolejki pod datą: ile zostało, ile zrobiono dziś na ekranie.
 * Pochodna liczona z widocznych wierszy — dziennik pozostaje jedynym źródłem bilansu zwycięstw.
 */
export function formatQueueMeta(remaining: number, done: number): string {
  const parts = [remaining > 0 ? `${remaining} do zrobienia` : 'nic do zrobienia']
  if (done > 0) parts.push(`${done} zrobione`)
  return parts.join(' · ')
}
