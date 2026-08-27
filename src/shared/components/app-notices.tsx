import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { dismissNotice, subscribe, type Notice } from '@/shared/lib/notify'
import { cn } from '@/lib/utils'

/**
 * Jedyny punkt prezentacji komunikatów systemowych (toast/baner błędu zapisu).
 * role=alert dla błędów (natychmiastowe ogłoszenie), status dla informacji.
 *
 * Stack żyje w top layer (popover="manual", luka #1 audytu tasks): natywny
 * <dialog>.showModal() — modal Zadań, domknięcie wątku — również siedzi w top
 * layer, więc zwykły fixed div renderowałby banery POD modalem i porażka zapisu
 * milczała do zamknięcia. Popover jest niemodalny (bez blokady strony, bez
 * kradzieży Esc); bez wsparcia przeglądarki degraduje do zwyczajnego fixed div.
 */
export function AppNotices() {
  const [items, setItems] = useState<Notice[]>([])
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => subscribe(setItems), [])

  // Top layer tylko gdy jest co pokazać; manual = bez light-dismiss i bez przechwytywania Esc.
  useEffect(() => {
    const layer = layerRef.current
    if (!layer || typeof layer.showPopover !== 'function') return
    try {
      const shown = layer.matches(':popover-open')
      if (items.length > 0 && !shown) layer.showPopover()
      else if (items.length === 0 && shown) layer.hidePopover()
    } catch {
      /* przeglądarka bez popover API — zostaje zwykły fixed div */
    }
  }, [items.length])

  return (
    /* Reset stylistyki popovera UA (margin/border/padding/tło/fit-content) — układ jak w designie. */
    <div
      ref={layerRef}
      popover="manual"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-3 z-[70] flex w-full flex-col items-center gap-2 overflow-visible border-0 bg-transparent p-0 px-4 text-foreground"
    >
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
