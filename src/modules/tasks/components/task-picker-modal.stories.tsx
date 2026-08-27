import type { Meta, StoryObj } from '@storybook/react'
import { useEffect } from 'react'
import { applyScenarioWithoutReload } from '@/scenarios/loader'
import { TaskPickerModal } from './task-picker-modal'

/**
 * Stany katalogu w modalu na realnej bazie Dexie (bez reloadu scenariusza).
 * Scenariusz `full` startuje z kolejną Teraz — część przełączników pokazuje stan aktywny.
 */

const seededWith =
  (seed: () => Promise<void>) =>
  (Story: () => React.ReactNode) => {
    useEffect(() => {
      void seed()
    }, [seed])
    return <Story />
  }

const meta: Meta<typeof TaskPickerModal> = {
  title: 'Tasks/TaskPickerModal',
  component: TaskPickerModal,
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof TaskPickerModal>

/** Modal otwarty nad ekranem: pełny katalog — sześć otwartych wątków, typy, po terminie, wybór Teraz. */
export const FullCatalogue: Story = {
  render: () => <TaskPickerModal open onClose={() => {}} />,
  decorators: [seededWith(() => applyScenarioWithoutReload('full'))],
}

/** Wątek istnieje, ale bez rozpisanych kroków — katalog pusty z zachętą do workbench. */
export const LoopsWithoutSteps: Story = {
  render: () => <TaskPickerModal open onClose={() => {}} />,
  decorators: [seededWith(() => applyScenarioWithoutReload('minimal'))],
}

/** Pierwsze uruchomienie — brak czegokolwiek. */
export const FreshWorld: Story = {
  render: () => <TaskPickerModal open onClose={() => {}} />,
  decorators: [seededWith(() => applyScenarioWithoutReload('empty'))],
}

/** Zamknięty modal nie renderuje niczego (natywny <dialog> poza trybem modalnym). */
export const ClosedByDefault: Story = {
  render: () => (
    <div className="flex h-64 items-center justify-center bg-muted/30 text-sm text-muted-foreground">
      Ekran Teraz — modal zamknięty
    </div>
  ),
}
