import { useEffect, useState } from 'react'

/**
 * Żywa „teraźniejszość” głównego ekranu (ADR-0020): dokładanie do zera każdej minuty,
 * bo widoczność to HH:MM. Zegar uśpionej karty dogania się przy odzyskaniu widoczności
 * / fokusu (konwencja resynchronizacji jak w dzienniku) — ten sam mechanizm obsługuje
 * przeskoczenie daty po północy.
 */
export function useNowClock(): Date {
  const [moment, setMoment] = useState(() => new Date())

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    let cancelled = false

    const scheduleNextMinute = () => {
      if (cancelled) return
      const current = new Date()
      const intoMinute = current.getSeconds() * 1000 + current.getMilliseconds()
      timer = setTimeout(() => {
        if (cancelled) return
        setMoment(new Date())
        scheduleNextMinute()
      }, 60_000 - intoMinute)
    }

    const rescheduleFromNow = () => {
      if (cancelled) return
      clearTimeout(timer)
      setMoment(new Date())
      scheduleNextMinute()
    }
    const onVisibility = () => {
      if (!document.hidden) rescheduleFromNow()
    }

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('focus', rescheduleFromNow)
    scheduleNextMinute()

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('focus', rescheduleFromNow)
      clearTimeout(timer)
    }
  }, [])

  return moment
}
