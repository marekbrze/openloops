import type { Meta, StoryObj } from '@storybook/react'
import { notify } from '@/shared/lib/notify'
import { openView } from '@/shared/lib/notify'
import { AppNotices } from './app-notices'

/**
 * Singleton globalny — stories wysyłają komunikaty przy montażu.
 * Kolejne historie czyścią stos wyłącznie po odświeżeniu Storybooka (dopuszczalne w lo-fi).
 */
const seededWith = (push: () => void) => (Story: () => React.ReactNode) => {
  push()
  return (
    <>
      <AppNotices />
      <Story />
      <div className="p-8 text-sm text-muted-foreground">Treść pod komunikatami…</div>
    </>
  )
}

const meta: Meta<typeof AppNotices> = {
  title: 'Shared/AppNotices',
  component: AppNotices,
}
export default meta

type Story = StoryObj<typeof AppNotices>

export const InfoToast: Story = {
  decorators: [seededWith(() => notify.info('Wątek porzucony — porzucenie nie liczy się jako zwycięstwo.'))],
}

/** Luka #5: po domknięciu wątku toast prowadzi do Dziennika. */
export const ActionToastToJournal: Story = {
  decorators: [
    seededWith(() =>
      notify.action('Domknięto „Redesign onboardingu” · większe zwycięstwo czeka w Dzienniku', 'Otwórz dziennik', () =>
        openView('journal'),
      ),
    ),
  ],
}

export const PersistentError: Story = {
  decorators: [seededWith(() => notify.error('Nie udało się zapisać zmiany — przeglądarka odmówiła dostępu do pamięci.'))],
}
