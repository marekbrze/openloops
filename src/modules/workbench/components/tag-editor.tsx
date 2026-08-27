import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import type { Tag } from '@/modules/data-layer'
import { cn } from '@/lib/utils'

interface TagEditorProps {
  tagsPool: Tag[]
  attachedTagIds: string[]
  onAttach: (tag: Tag) => void
  onDetach: (tag: Tag) => void
  /** Wolne wpisywanie tworzy nowy tag we wspólnej puli (ADR-0008). */
  onCreateAndAttach: (name: string) => void
}

/**
 * Chipy tagów + mini combobox lo-fi. Wpisanie istniejącej nazwy dobiera ją,
 * nowej — tworzy przy pierwszym użyciu.
 */
export function TagEditor({ tagsPool, attachedTagIds, onAttach, onDetach, onCreateAndAttach }: TagEditorProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus po rozwinięciu comboboxa — bez atrybutu autoFocus (jsx-a11y/no-autofocus).
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const attachedSet = useMemo(() => new Set(attachedTagIds), [attachedTagIds])
  const matches = tagsPool.filter((t) => !attachedSet.has(t.id) && t.name.toLowerCase().includes(query.toLowerCase()))
  const exactNew = query.trim() !== '' && !tagsPool.some((t) => t.name.toLowerCase() === query.trim().toLowerCase())

  const pickExisting = () => {
    if (matches.length === 0) return
    onAttach(matches[0])
    setQuery('')
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      if (exactNew) onCreateAndAttach(query.trim())
      else pickExisting()
      setOpen(false)
    }
    if (event.key === 'Escape') {
      setQuery('')
      setOpen(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1" data-no-select>
      {[...attachedSet].map((id) => {
        const tag = tagsPool.find((t) => t.id === id)
        if (!tag) return null
        return (
          <span
            key={id}
            className="inline-flex items-center gap-0.5 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground"
          >
            {tag.name}
            <button
              type="button"
              onClick={() => onDetach(tag)}
              aria-label={`Odepnij tag ${tag.name}`}
              className="rounded-full p-0.5 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-3" />
            </button>
          </span>
        )
      })}
      {open ? (
        <div className="relative">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            aria-label="Nazwa tagu — wpisz nową lub wybierz z podpowiedzi"
            placeholder="nazwa tagu…"
            className="h-6 w-32 rounded-full border border-ring bg-background px-2 text-[11px] outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          {(matches.length > 0 || exactNew) && (
            <ul
              role="listbox"
              aria-label="Podpowiedzi tagów"
              className="absolute left-0 top-full z-30 mt-1 max-h-36 min-w-40 overflow-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md"
            >
              {matches.map((tag) => (
                <li key={tag.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onAttach(tag)
                      setQuery('')
                      setOpen(false)
                    }}
                    className="w-full rounded-md px-2 py-1 text-left text-xs hover:bg-muted"
                  >
                    {tag.name}
                  </button>
                </li>
              ))}
              {exactNew && (
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      onCreateAndAttach(query.trim())
                      setQuery('')
                      setOpen(false)
                    }}
                    className="w-full rounded-md px-2 py-1 text-left text-xs hover:bg-muted"
                  >
                    Utwórz „{query.trim()}”
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Dodaj tag do wątku"
          className={cn(
            'rounded-full border border-dashed border-border px-2 py-0.5 text-[11px] text-muted-foreground',
            'hover:border-ring hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
          )}
        >
          + tag
        </button>
      )}
    </div>
  )
}
