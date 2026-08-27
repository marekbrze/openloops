import type { Meta, StoryObj } from '@storybook/react'
import { PanelPlaceholder } from './action-panel'

const meta: Meta<typeof PanelPlaceholder> = {
  title: 'Workbench/PanelPlaceholder',
  component: PanelPlaceholder,
}
export default meta

type Story = StoryObj<typeof PanelPlaceholder>

/** ADR-0005 + luka #8 audytu: stały layout, dwa warianty copy. */
export const ChooseLoop: Story = {
  render: () => (
    <div style={{ height: 360 }}>
      <PanelPlaceholder />
    </div>
  ),
}

export const FirstRunInvitation: Story = {
  render: () => (
    <div style={{ height: 360 }}>
      <PanelPlaceholder firstRun />
    </div>
  ),
}
