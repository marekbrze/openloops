import type { Meta, StoryObj } from '@storybook/react'
import { SkeletonCards } from './skeleton-cards'

const meta: Meta<typeof SkeletonCards> = {
  title: 'Shared/SkeletonCards',
  component: SkeletonCards,
}
export default meta

type Story = StoryObj<typeof SkeletonCards>

export const ThreeRows: Story = {
  args: { count: 3 },
}

export const SingleRow: Story = {
  args: { count: 1 },
}
