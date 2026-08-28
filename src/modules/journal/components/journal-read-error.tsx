import { Button } from '@/components/ui/button'

interface JournalReadErrorProps {
  onRetry(): void
}

/**
 * Karta porażki odczytu (luka #2 audytu): komunikat + droga powrotu.
 * Zamiast niej wieczny szkielet albo biel aplikacji; dane IndexedDB zostają nietknięte.
 */
export function JournalReadError({ onRetry }: JournalReadErrorProps) {
  return (
    <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-center">
      <h2 className="text-base font-semibold">Dziennik nie może odczytać zapisów</h2>
      <p className="pt-2 text-sm text-muted-foreground">
        Lokalna baza danych (IndexedDB) odrzuciła odczyt — najczęstsze powody to tryb prywatny
        albo zablokowana pamięć strony. Twoje zapisy nie zginęły.
      </p>
      <Button className="mt-4" onClick={onRetry}>
        Spróbuj ponownie
      </Button>
    </div>
  )
}
