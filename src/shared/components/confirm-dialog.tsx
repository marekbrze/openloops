import { Dialog } from '@/shared/components/dialog'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  open: boolean
  heading: string
  body: string
  confirmLabel?: string
  destructive?: boolean
  onCancel: () => void
  onConfirm: () => void
}

/** Potwierdzenie destrukcyjnych akcji (ACTIONS.md): Usuń wątek / akcję done itd. */
export function ConfirmDialog({
  open,
  heading,
  body,
  confirmLabel = 'Usuń',
  destructive = true,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} labelId="confirm-heading" describeId="confirm-body">
      <h2 id="confirm-heading" className="text-base font-semibold">
        {heading}
      </h2>
      <p id="confirm-body" className="pt-2 text-sm text-muted-foreground">
        {body}
      </p>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Anuluj
        </Button>
        <Button data-autofocus variant={destructive ? 'destructive' : 'default'} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  )
}
