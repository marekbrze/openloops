import type { Meta, StoryObj } from '@storybook/react'
import { NowReadError } from './now-screen'

/**
 * Karta porażki odczytu kolejki (luka #3 audytu Teraz) — konwencja dziennika:
 * komunikat o nieinwazyjnej przyczynie + droga powrotu; dane zostają nietknięte.
 * Tej samej karty używa porażka odczytu liczby wątków w stanie pustym (luka #1).
 */

const meta: Meta<typeof NowReadError> = {
  title: 'Now/NowReadError',
  component: NowReadError,
}
export default meta

type Story = StoryObj<typeof NowReadError>

export const Card: Story = {
  render: () => (
    <div className="mx-auto max-w-xl p-4">
      <NowReadError onRetry={() => {}} />
    </div>
  ),
}
