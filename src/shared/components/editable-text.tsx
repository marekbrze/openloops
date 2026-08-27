import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'

interface EditableTextProps {
  value: string
  onChange: (value: string) => void
  /** Dostępna nazwa pola (np. „Tytuł wątku”). */
  ariaLabel: string
  placeholder?: string
  className?: string
  /** Wielolinijkowa edycja (cel) — zapis na blur, nowe linie dozwolone. */
  multiline?: boolean
}

/**
 * Konwencja klik-to-edit (ADR-0009): klik w tekst zamienia go w pole;
 * Enter zapisuje, Esc anuluje, blur zapisuje. Bez dialogów przy drobnych poprawkach.
 */
export function EditableText({ value, onChange, ariaLabel, placeholder, className, multiline }: EditableTextProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const fieldRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (!editing) return
    const field = fieldRef.current
    if (!field) return
    field.focus()
    if (field instanceof HTMLInputElement) field.select()
    else {
      field.setSelectionRange(field.value.length, field.value.length)
    }
  }, [editing])

  const startEditing = () => {
    setDraft(value)
    setEditing(true)
  }

  const commit = () => {
    const trimmed = draft.trim()
    // Pusty tekst nie wypala istniejącej treści do zera (ochrona przed stray-backspace).
    if (trimmed && trimmed !== value) onChange(trimmed)
    setEditing(false)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      setDraft(value)
      setEditing(false)
      return
    }
    if (!multiline && event.key === 'Enter') {
      event.preventDefault()
      commit()
    }
  }

  if (editing) {
    const fieldClass = cn(
      'w-full rounded-md border border-ring bg-background px-1.5 py-0.5 text-inherit font-inherit outline-none',
      'focus-visible:ring-3 focus-visible:ring-ring/50',
      className,
    )
    return multiline ? (
      <textarea
        ref={fieldRef as React.Ref<HTMLTextAreaElement>}
        className={fieldClass}
        value={draft}
        rows={2}
        aria-label={ariaLabel}
        onBlur={commit}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
      />
    ) : (
      <input
        ref={fieldRef as React.Ref<HTMLInputElement>}
        className={fieldClass}
        value={draft}
        aria-label={ariaLabel}
        onBlur={commit}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      aria-label={`${ariaLabel}: ${value || placeholder || 'puste'}. Kliknij, aby edytować.`}
      title={`Kliknij, aby edytować (${ariaLabel.toLowerCase()})`}
      className={cn(
        'block w-full cursor-text rounded-md border border-transparent px-1.5 py-0.5 text-left whitespace-pre-wrap break-words',
        'hover:border-border hover:bg-muted/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
        (!value || value.trim() === '') && 'text-muted-foreground italic',
        className,
      )}
    >
      {value.trim() === '' ? (placeholder ?? 'Dodaj…') : value}
    </button>
  )
}
