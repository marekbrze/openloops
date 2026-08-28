import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ChevronDown } from 'lucide-react'
import { loopsRepo } from '@/modules/data-layer'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AddLoopFormProps {
  /** Identyfikator świeżo dodanego wątku — wywoławczy zwykle go zaznacza (ADR-0003). */
  onAdded: (loopId: string) => void
  /** Focus na tytule przy pierwszym uruchomieniu (pusta lista) — bez atrybutu autoFocus. */
  focusOnMount?: boolean
}

/**
 * Quick capture (ADR-0004): inline formularz nad listą — tytuł Enterem,
 * pole celu opcjonalne po rozwinięciu. Bez modala.
 */
export function AddLoopForm({ onAdded, focusOnMount }: AddLoopFormProps) {
  const [title, setTitle] = useState('')
  const [goalOpen, setGoalOpen] = useState(false)
  const [goalText, setGoalText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (focusOnMount) titleInputRef.current?.focus()
  }, [focusOnMount])

  /** Luka #4 audytu: flaga busy blokuje podwójny Enter podczas trwającego zapisu. */
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (busy) return
    const trimmed = title.trim()
    if (!trimmed) {
      setError('Nazwij wątek — bez tytułu nie ma o czym notować.')
      return
    }
    setBusy(true)
    try {
      const loop = await loopsRepo.add(trimmed, goalText.trim())
      setTitle('')
      setGoalText('')
      setGoalOpen(false)
      setError(null)
      onAdded(loop.id)
    } catch (error) {
      console.error('[openloops] dodanie wątku nie powiodło się', error)
      setError('Nie udało się zapisać — pamięć przeglądarki odmówiła. Spróbuj ponownie.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-border bg-card p-2 transition-colors duration-150 focus-within:border-ring/50" noValidate>
      <div className="flex items-center gap-1">
        <input
          ref={titleInputRef}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (error) setError(null)
          }}
          aria-label="Tytuł nowego wątku"
          placeholder="Nazwij otwarty wątek… (np. brief pod kampanię Q4)"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'add-loop-error' : undefined}
          className="h-8 min-w-0 flex-1 rounded-md bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:bg-muted/50"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={goalOpen ? 'Zwiń pole celu' : 'Rozwiń pole celu'}
          aria-expanded={goalOpen}
          onClick={() => setGoalOpen((v) => !v)}
        >
          <ChevronDown className={cn('transition-transform', goalOpen && 'rotate-180')} />
        </Button>
        <Button type="submit" size="sm" disabled={busy || title.trim() === ''}>
          {busy ? 'Zapisuję…' : 'Dodaj wątek'}
        </Button>
      </div>
      {goalOpen && (
        <input
          value={goalText}
          onChange={(e) => setGoalText(e.target.value)}
          aria-label="Cel nowego wątku (opcjonalny)"
          placeholder="Po czym wiem, że gotowe? (opcjonalne)"
          className="mt-1 h-8 w-full rounded-md border border-dashed border-border bg-muted px-2 text-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      )}
      {error && (
        <p id="add-loop-error" role="alert" className="px-2 pt-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </form>
  )
}
