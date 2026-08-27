import type { Meta, StoryObj } from '@storybook/react'
import { JournalReadError } from './journal-read-error'

const meta: Meta<typeof JournalReadError> = {
  title: 'Journal/JournalReadError',
  component: JournalReadError,
}
export default meta

type Story = StoryObj<typeof JournalReadError>

/** Karta porażki odczytu IndexedDB — stan z luki #2 audytu. */
export const ReadFailureCard: Story = {
  args: { onRetry: () => {} },
}
