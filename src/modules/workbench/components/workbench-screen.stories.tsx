import type { Meta, StoryObj } from '@storybook/react'
import { useEffect } from 'react'
import { WorkbenchScreen } from './workbench-screen'
import { applyScenarioWithoutReload } from '@/scenarios/loader'

/**
 * Integracyjne stany ekranu seedują realną bazę Dexie bez reloadu scenariusza.
 * Kolejne historie czyszczą dane poprzedniej — każda widzi deterministiczny świat.
 */
const seededWith = (scenario: string) => (Story: () => React.ReactNode) => {
  useEffect(() => {
    void applyScenarioWithoutReload(scenario)
  }, [scenario])
  return <Story />
}

const heightDecorator = (Story: () => React.ReactNode) => (
  <div style={{ height: 640 }}>
    <Story />
  </div>
)

const meta: Meta<typeof WorkbenchScreen> = {
  title: 'Workbench/WorkbenchScreen',
  component: WorkbenchScreen,
}
export default meta

type Story = StoryObj<typeof WorkbenchScreen>

export const FullWorkday: Story = {
  decorators: [heightDecorator, seededWith('full')],
}

export const SingleFreshLoop: Story = {
  decorators: [heightDecorator, seededWith('minimal')],
}

export const FirstRunEmpty: Story = {
  decorators: [heightDecorator, seededWith('empty')],
}
