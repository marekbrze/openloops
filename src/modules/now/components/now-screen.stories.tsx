import type { Meta, StoryObj } from '@storybook/react'
import { useEffect } from 'react'
import { applyScenarioWithoutReload } from '@/scenarios/loader'
import { db } from '@/modules/data-layer'
import { NowScreen } from './now-screen'

/**
 * Integracyjne stany głównego ekranu seedują realną bazę Dexie bez reloadu scenariusza.
 * Kolejka fixture'ów (makieta → KPI → abonamenty → dopytanie po terminie) żyje na
 * źródłowych akcjach scenariusza `full` — daty liczą się względem DZIŚ.
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

const meta: Meta<typeof NowScreen> = {
  title: 'Now/NowScreen',
  component: NowScreen,
}
export default meta

type Story = StoryObj<typeof NowScreen>

/** Dzień w toku: trzy pozycje do zrobienia + czekanie po terminie na końcu. */
export const OrderedDayShowcase: Story = {
  decorators: [heightDecorator, seededWith(() => applyScenarioWithoutReload('full'))],
}

/** Pierwsza pozycja odhaczona — zostaje w kolejce (ADR-0023) z CTA masowego zdejmowania. */
export const MixedWithDone: Story = {
  decorators: [
    heightDecorator,
    seededWith(async () => {
      await applyScenarioWithoutReload('full')
      await db.actions.update('act-loop-onboarding-1-makieta', { done: true, doneAt: new Date().toISOString() })
    }),
  ],
}

/** Świat bez żadnego wątku — pierwsze uruchomienie aplikacji. */
export const FreshWorld: Story = {
  decorators: [heightDecorator, seededWith(() => applyScenarioWithoutReload('empty'))],
}

/** Są otwarte wątki, ale nic nie wybrane do Teraz — zachęta do otwarcia „Wybierz zadania”. */
export const NothingPickedYet: Story = {
  decorators: [heightDecorator, seededWith(() => applyScenarioWithoutReload('minimal'))],
}
