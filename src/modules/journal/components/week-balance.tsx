import { CheckCircle2, Trophy } from 'lucide-react'
import type { WeekBalance } from '../hooks/use-journal'

type WeekBalanceCardProps = WeekBalance

/**
 * Teza ekranu — hierarchia liczb ponad dni (MODULES.md). Bilans zawsze widoczny,
 * także jako uczciwe 0 · 0 z neutralną notką (ADR-0017), bez maskowania pustki.
 */
export function WeekBalanceCard({ smallWins, bigWins }: WeekBalanceCardProps) {
  const emptyWeek = smallWins + bigWins === 0
  return (
    <section aria-label="Bilans tygodnia" className="space-y-2">
      <div className="grid grid-cols-2 gap-3">
        <BalanceTile
          icon={<CheckCircle2 className="size-4" aria-hidden="true" />}
          label="Małe zwycięstwa"
          hint="skończone akcje"
          value={smallWins}
        />
        <BalanceTile
          icon={<Trophy className="size-4" aria-hidden="true" />}
          label="Większe zwycięstwa"
          hint="domknięte wątki"
          value={bigWins}
        />
      </div>
      {emptyWeek && (
        <p className="text-sm text-muted-foreground">Ten tydzień nie zapisał żadnych zwycięstw.</p>
      )}
    </section>
  )
}

function BalanceTile({
  icon,
  label,
  hint,
  value,
}: {
  icon: React.ReactNode
  label: string
  hint: string
  value: number
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="pt-1 text-4xl font-semibold tabular-nums tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}
