import { useEffect, useRef, useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export interface MenuItem {
  label: string
  onSelect: () => void
  destructive?: boolean
}

interface SimpleMenuProps {
  /** Etykieta dostępna przycisku wyzwalacza. */
  ariaLabel: string
  items: MenuItem[]
}

/**
 * Minimalne menu kontekstowe lo-fi (akcje rzadkie/destrukcyjne — ADR-0010):
 * Esc i kliknięcie zamykają, focus wraca na przycisk.
 */
export function SimpleMenu({ ariaLabel, items }: SimpleMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }))}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <MoreHorizontal />
      </button>
      {open && (
        <ul
          role="menu"
          aria-label={ariaLabel}
          className="absolute right-0 top-full z-40 mt-1 min-w-44 overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {items.map((item) => (
            <li key={item.label} role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false)
                  item.onSelect()
                }}
                className={cn(
                  'w-full rounded-md px-2.5 py-1.5 text-left text-sm hover:bg-muted',
                  item.destructive && 'text-destructive hover:bg-destructive/10',
                )}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
