import type { Meta, StoryObj } from '@storybook/react'
import type { Loop } from '@/modules/data-layer'
import { CloseLoopModal } from './close-loop-modal'

const loopFixture: Loop = {
  id: 'loop-close-demo',
  title: 'Audyt komponentów pod design system',
  status: 'open',
  sortOrder: -1,
  goalText: 'Lista komponentów do migracji zaakceptowana przez devów.',
  tagIds: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const meta: Meta<typeof CloseLoopModal> = {
  title: 'Workbench/CloseLoopModal',
  component: CloseLoopModal,
}
export default meta

type Story = StoryObj<typeof CloseLoopModal>

export const CelebrationOpen: Story = {
  render: () => <div className="p-8"><CloseLoopModal loop={loopFixture} onClose={() => {}} /></div>,
}

export const HiddenWhenNoLoop: Story = {
  render: () => <div className="p-8"><CloseLoopModal loop={null} onClose={() => {}} /></div>,
}
