import { useRef, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'

interface ActionAddFormProps {
  onAdd: (label: string) => void
}

/** Dopisywanie kroku do zaznaczonego wątku — szybkie pole nad przypiętym celem. */
export function ActionAddForm({ onAdd }: ActionAddFormProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setValue('')
    // Zachowaj focus — rozpisywanie serii kroków idzie bez przełączania kontekstu.
    inputRef.current?.focus()
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-1.5 rounded-lg border border-dashed border-border p-1.5">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Etykieta nowej akcji"
        placeholder="Dopisz krok do wątku…"
        className="h-7 min-w-0 flex-1 rounded-md bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:bg-muted/50"
      />
      <Button type="submit" size="sm" variant="outline" disabled={!value.trim()}>
        Dodaj
      </Button>
    </form>
  )
}
