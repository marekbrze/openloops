import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/*
 * Tło-modal zamknięte klikiem jest oceniane przez jsx-a11y jak interakcja na elemencie
 * nieterminalnym — odpowiednik klawiaturowy (Esc) daje natywny tryb modalny <dialog> (cancel poniżej).
 */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */

interface DialogProps {
  open: boolean
  onClose: () => void
  /** id nagłówka dla aria-labelledby */
  labelId: string
  describeId?: string
  children: ReactNode
  className?: string
}

/**
 * Natywny <dialog> w trybie modalnym: Esc i pułapka focusa są wbudowane w przeglądarkę,
 * focus wraca do elementu otwierającego automatycznie. Kliknięcie tła zamyka.
 */
export function Dialog({ open, onClose, labelId, describeId, children, className }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    else if (!open && dialog.open) dialog.close()
  }, [open])

  /** Klik trafia na <dialog> tylko poza panelem treści — to jest nasz „klik w tło”. */
  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) onClose()
  }

  const handleCancel = (event: React.SyntheticEvent<HTMLDialogElement>) => {
    // Esc: nie pozwól przeglądarce anulować po cichu — domyka się przez stan aplikacji.
    event.preventDefault()
    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelId}
      aria-describedby={describeId}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      className={cn(
        'm-auto max-w-md rounded-xl border border-border bg-background p-6 text-foreground shadow-xl outline-none',
        'backdrop:bg-foreground/50 backdrop:backdrop-blur-[1px]',
        className,
      )}
    >
      {children}
    </dialog>
  )
}
