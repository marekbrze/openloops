import type { ViewId } from '@/lib/navigation'

export interface Notice {
  id: number
  tone: 'info' | 'error'
  message: string
  actionLabel?: string
  onAction?: () => void
}

type Listener = (notices: Notice[]) => void

const stack: Notice[] = []
const listeners = new Set<Listener>()
let seq = 0

function emit() {
  const snapshot = [...stack]
  listeners.forEach((listener) => listener(snapshot))
}

export function dismissNotice(id: number) {
  const index = stack.findIndex((n) => n.id === id)
  if (index >= 0) {
    stack.splice(index, 1)
    emit()
  }
}

function push(notice: Omit<Notice, 'id'>): number {
  const id = ++seq
  stack.push({ ...notice, id })
  emit()
  if (notice.tone !== 'error') window.setTimeout(() => dismissNotice(id), 6000)
  return id
}

export const notify = {
  info(message: string) {
    return push({ tone: 'info', message })
  },
  /** Komunikat z akcją (np. „Otwórz dziennik”). */
  action(message: string, actionLabel: string, onAction: () => void) {
    return push({ tone: 'info', message, actionLabel, onAction })
  },
  error(message: string) {
    // Błędy nie znikają same — użytkownik ma czas przeczytać; zamyka krzyżykiem.
    return push({ tone: 'error', message })
  },
}

export function subscribe(listener: Listener) {
  listeners.add(listener)
  listener([...stack])
  return () => {
    listeners.delete(listener)
  }
}

/** Przejście między widokami shellu bez prop-drillingu (toast → Dziennik). */
export function openView(view: ViewId) {
  window.dispatchEvent(new CustomEvent('openloops:navigate', { detail: view }))
}
