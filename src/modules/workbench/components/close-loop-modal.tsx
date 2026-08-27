import { Trophy } from 'lucide-react'
import { closeLoopWithWin } from '@/modules/data-layer'
import type { Loop } from '@/modules/data-layer'
import { guard } from '@/shared/lib/mutations'
import { Dialog } from '@/shared/components/dialog'
import { Button } from '@/components/ui/button'

interface CloseLoopModalProps {
  loop: Loop | null
  onClose: () => void
  /** Panel podaje własny przebieg potwierdzenia (zapis + toast); domyślnie sam zapis do repo. */
  onConfirm?: () => Promise<void> | void
}

/**
 * Moment domknięcia (ADR-0001): celebracja + nazwany przepływ informacji do dziennika.
 * Domknięcie nie wymaga odhaczonych wszystkich akcji — decyzja należy do celu.
 * Nieudany zapis zostawia modal otwarty; baner błędu tłumaczy powód.
 */
export function CloseLoopModal({ loop, onClose, onConfirm }: CloseLoopModalProps) {
  const confirm = async (): Promise<void> => {
    if (!loop) return onClose()
    if (onConfirm) {
      await onConfirm()
      return
    }
    if (await guard(() => closeLoopWithWin(loop))) onClose()
  }

  return (
    <Dialog open={Boolean(loop)} onClose={onClose} labelId="close-loop-title" describeId="close-loop-desc">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-primary/10 p-2 text-primary">
          <Trophy className="size-5" />
        </span>
        <h2 id="close-loop-title" className="text-lg font-semibold tracking-tight">
          Cel osiągnięty
        </h2>
      </div>

      <p className="pt-3 text-sm font-medium">{loop?.title}</p>
      <p id="close-loop-desc" className="pt-1 text-sm text-muted-foreground">
        Wpis trafi do dziennika jako większe zwycięstwo dnia. Niezakończone akcje nie stoją na przeszkodzie — o domknięciu decyduje cel.
      </p>

      <div className="flex justify-end gap-2 pt-5">
        <Button variant="outline" onClick={onClose}>
          Jeszcze nie teraz
        </Button>
        <Button data-autofocus onClick={() => void confirm()}>
          Domknij wątek
        </Button>
      </div>
    </Dialog>
  )
}
