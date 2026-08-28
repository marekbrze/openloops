import { Flag } from 'lucide-react'
import { EditableText } from '@/shared/components/editable-text'

interface PinnedGoalProps {
  goalText: string
  onUpdate: (goalText: string) => void
}

/**
 * Cel przypięty jako ostatni element listy działań — wizualnie odseparowany,
 * poza sortowalnym kontekstem (nie podnosi się jako źródło i nie przyjmuje dropów).
 */
export function PinnedGoal({ goalText, onUpdate }: PinnedGoalProps) {
  return (
    <div className="mt-3 border-t pt-3" data-goal>
      <div className="rounded-lg border border-dashed border-border bg-card p-3">
        {/* Nagłówek zwykłym case'em z glyphem wiodącym — bez uppercase-eyebrow (ban z DESIGN.md). */}
        <div className="flex items-center gap-1.5 pb-1 text-xs font-medium text-muted-foreground">
          <Flag className="size-3.5 shrink-0" />
          Cel — po czym wiem, że gotowe
        </div>
        <EditableText
          value={goalText}
          onChange={onUpdate}
          ariaLabel="Cel wątku"
          multiline
          placeholder="Opisz stan, w którym ten wątek da się domknąć…"
          className="text-sm leading-snug"
        />
      </div>
    </div>
  )
}
