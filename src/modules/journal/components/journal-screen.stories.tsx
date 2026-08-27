import type { Meta, StoryObj } from '@storybook/react'
import { useEffect } from 'react'
import { applyScenarioWithoutReload } from '@/scenarios/loader'
import { db } from '@/modules/data-layer'
import type { DayEntry } from '@/modules/data-layer'
import { startOfWeek, toDayKey } from '../lib/journal-date'
import { JournalScreen } from './journal-screen'

/**
 * Integracyjne stany ekranu seedują realną bazę Dexie bez reloadu scenariusza.
 * Fixtura tygodnia liczy się względem DZIŚ: dni przeszłe bieżącego tygodnia dostają
 * przykładowe zwycięstwa, dni przyszłe zostają puste — tydzień trwa (spec).
 */

const heightDecorator = (Story: () => React.ReactNode) => (
  <div style={{ height: 640 }}>
    <Story />
  </div>
)

const seededWith =
  (seed: () => Promise<void>) =>
  (Story: () => React.ReactNode) => {
    useEffect(() => {
      void seed()
    }, [seed])
    return <Story />
  }

async function seedJournalShowcase(): Promise<void> {
  await applyScenarioWithoutReload('full')

  const today = new Date()
  const monday = startOfWeek(today)
  const dayAt = (weekdayOffset: number): Date => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + weekdayOffset)
    return d
  }
  const todayIndex = Array.from({ length: 7 }, (_, i) => toDayKey(dayAt(i))).indexOf(toDayKey(today))

  type EntryPlan = {
    weekdayOffset: number
    hour: number
    minute: number
    kind: DayEntry['kind']
    slug: string
    text: string
    loopId?: string
  }

  /* Realistyczny rozkład zwycięstw w tygodniu roboczym; piątek z domknięciem wątku na koniec. */
  const PLAN: EntryPlan[] = [
    { weekdayOffset: 0, hour: 9, minute: 15, kind: 'action-done', slug: 'agenda-retro', text: 'Rozpisać agendę retrospektywy' },
    { weekdayOffset: 0, hour: 14, minute: 40, kind: 'action-done', slug: 'kpi-brief', text: 'Uzupełnić sekcję KPI liczbami z analytics' },
    { weekdayOffset: 1, hour: 10, minute: 5, kind: 'action-done', slug: 'insighty-wywiady', text: 'Zebrać insighty z 5 wywiadów onboardingowych' },
    { weekdayOffset: 1, hour: 16, minute: 55, kind: 'action-done', slug: 'szablon-retro', text: 'Przygotować szablon retro' },
    { weekdayOffset: 2, hour: 11, minute: 30, kind: 'loop-closed', slug: 'abonamenty', text: 'Porządek w abonamentach narzędziowych', loopId: 'loop-abonamenty' },
    { weekdayOffset: 3, hour: 9, minute: 50, kind: 'action-done', slug: 'koszty-roczne', text: 'Przeliczyć koszt roczny poszczególnych planów' },
    { weekdayOffset: 3, hour: 15, minute: 25, kind: 'action-done', slug: 'budzet-marki', text: 'Potwierdzić budżet u finansów' },
    { weekdayOffset: 4, hour: 10, minute: 10, kind: 'action-done', slug: 'prawne-uwagi', text: 'Zebrać uwagi prawne do szkicu umowy' },
    { weekdayOffset: 4, hour: 18, minute: 35, kind: 'loop-closed', slug: 'audit-ds', text: 'Audyt komponentów pod design system', loopId: 'loop-audit-ds' },
  ]

  const entries: DayEntry[] = PLAN.filter((plan) => plan.weekdayOffset <= todayIndex).map((plan) => {
    // Dzień dzisiejszy zamiast sztywnej godziny dostaje czas „tuż przed teraz” — fixture nigdy nie pochodzi z przyszłości.
    const at = dayAt(plan.weekdayOffset)
    if (plan.weekdayOffset === todayIndex) at.setMinutes(at.getMinutes() - 30, 0, 0)
    else at.setHours(plan.hour, plan.minute, 0, 0)

    const dayKey = toDayKey(at)
    return {
      id: `story-${plan.slug}:${dayKey}`,
      kind: plan.kind,
      loopId: plan.loopId ?? '',
      actionId: undefined,
      snapshotText: plan.text,
      dayKey,
      createdAt: at.toISOString(),
      updatedAt: at.toISOString(),
    }
  })

  await db.transaction('rw', db.dayEntries, async () => {
    await db.dayEntries.clear()
    await db.dayEntries.bulkAdd(entries)
  })
}

const meta: Meta<typeof JournalScreen> = {
  title: 'Journal/JournalScreen',
  component: JournalScreen,
}
export default meta

type Story = StoryObj<typeof JournalScreen>

export const ShowcasedWeek: Story = {
  decorators: [heightDecorator, seededWith(seedJournalShowcase)],
}

export const EmptyCurrentWeek: Story = {
  decorators: [heightDecorator, seededWith(() => applyScenarioWithoutReload('empty'))],
}
