import { useRef, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'

interface ActionAddFormProps {
  /** Zwraca sukces zapisu — pole czyści się wyłącznie po potwierdzonej operacji. */
  onAdd: (label: string) => Promise<boolean>
}

/** Dopisywanie kroku do zaznaczonego wątku — szybkie pole nad przypiętym celem. */
export function ActionAddForm({ onAdd }: ActionAddFormProps) {
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (busy) return
    const trimmed = value.trim()
    if (!trimmed) return
    setBusy(true)
    try {
      // Czyszczenie dopiero po sukcesie (luka #4): przy porażce tekst zostaje w polu.
      if (await onAdd(trimmed)) setValue('')
    } finally {
      setBusy(false)
      // Zachowaj focus — rozpisywanie serii kroków idzie bez przełączania kontekstu.
      inputRef.current?.focus()
    }
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
      <Button type="submit" size="sm" variant="outline" disabled={busy || !value.trim()}>
        {busy ? 'Dodaję…' : 'Dodaj'}
      </Button>
    </form>
  )
}
