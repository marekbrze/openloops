import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { dismissNotice, subscribe, type Notice } from '@/shared/lib/notify'
import { cn } from '@/lib/utils'

/**
 * Jedyny punkt prezentacji komunikatów systemowych (toast/baner błędu zapisu).
 * role=alert dla błędów (natychmiastowe ogłoszenie), status dla informacji.
 */
export function AppNotices() {
  const [items, setItems] = useState<Notice[]>([])

  useEffect(() => subscribe(setItems), [])

  if (items.length === 0) return null

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-3 z-[70] flex flex-col items-center gap-2 px-4">
      {items.map((notice) => (
        <div
          key={notice.id}
          role={notice.tone === 'error' ? 'alert' : 'status'}
          className={cn(
            'pointer-events-auto flex max-w-md items-start gap-2 rounded-lg border bg-card px-3 py-2 text-sm shadow-lg',
            notice.tone === 'error' ? 'border-destructive/40 text-destructive' : 'border-border',
          )}
        >
          <p className="min-w-0 flex-1">{notice.message}</p>
          {notice.actionLabel && (
            <button
              type="button"
              onClick={() => {
                notice.onAction?.()
                dismissNotice(notice.id)
              }}
              className="shrink-0 rounded-md px-2 py-0.5 font-medium underline-offset-2 hover:bg-muted hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              {notice.actionLabel}
            </button>
          )}
          <button
            type="button"
            onClick={() => dismissNotice(notice.id)}
            aria-label="Zamknij komunikat"
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
