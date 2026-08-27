import type { Meta, StoryObj } from '@storybook/react'
import { CatalogueReadError } from './task-picker-modal'

/**
 * Karta porażki odczytu katalogu (konwencja dziennika) — pokazywana w modalu
 * zarówno przy porażce kwerendy katalogu, jak i członkostwa Teraz (luka #5 audytu
 * tasks: retry odgrzewa oba odczyty jednym tokenem).
 */

const meta: Meta<typeof CatalogueReadError> = {
  title: 'Tasks/CatalogueReadError',
  component: CatalogueReadError,
}
export default meta

type Story = StoryObj<typeof CatalogueReadError>

export const Card: Story = {
  render: () => (
    <div className="mx-auto max-w-xl p-4">
      <CatalogueReadError onRetry={() => {}} />
    </div>
  ),
}
