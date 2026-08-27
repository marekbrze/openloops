interface SkeletonCardsProps {
  count?: number
}

/**
 * Szkielet ładowania listy wątków — rytm zbliżony do prawdziwej karty
 * (tytuł + pasek progresu), bez fałszywej treści.
 */
export function SkeletonCards({ count = 3 }: SkeletonCardsProps) {
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="animate-pulse rounded-lg border border-border bg-card p-2">
          <div className="flex items-center gap-2">
            <div className="size-4 rounded bg-muted" />
            <div className="h-3.5 flex-1 rounded bg-muted" />
          </div>
          <div className="mt-2 h-1.5 w-2/3 rounded-full bg-muted" />
        </div>
      ))}
    </div>
  )
}
