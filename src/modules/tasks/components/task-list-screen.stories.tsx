import type { Meta, StoryObj } from '@storybook/react'
import { useEffect } from 'react'
import { applyScenarioWithoutReload } from '@/scenarios/loader'
import { TaskListScreen } from './task-list-screen'

/**
 * Stany katalogu na realnej bazie Dexie (bez reloadu scenariusza).
 * Scenariusz `full` startuje z kolejną Teraz — część przełączników pokazuje stan aktywny.
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

const meta: Meta<typeof TaskListScreen> = {
  title: 'Tasks/TaskListScreen',
  component: TaskListScreen,
}
export default meta

type Story = StoryObj<typeof TaskListScreen>

/** Pełny katalog: sześć otwartych wątków, typy mój ruch/czekam, po terminie i wybór Teraz. */
export const FullCatalogue: Story = {
  decorators: [heightDecorator, seededWith(() => applyScenarioWithoutReload('full'))],
}

/** Wątek istnieje, ale bez rozpisanych kroków — katalog pusty z zachętą do workbench. */
export const LoopsWithoutSteps: Story = {
  decorators: [heightDecorator, seededWith(() => applyScenarioWithoutReload('minimal'))],
}

/** Pierwsze uruchomienie — brak czegokolwiek. */
export const FreshWorld: Story = {
  decorators: [heightDecorator, seededWith(() => applyScenarioWithoutReload('empty'))],
}
