import type { Meta, StoryObj } from '@storybook/react'
import { DndContext } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { LoopAction } from '@/modules/data-layer'
import { SortableActionRow } from './action-row'

const ts = new Date().toISOString()
const pad = (n: number) => String(n).padStart(2, '0')
const dkey = (offset = 0) => {
  const d = new Date(Date.now() + offset * 86_400_000)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const mkAction = (patch: Partial<LoopAction>): LoopAction => ({
  id: 'act-story',
  loopId: 'loop-demo',
  label: 'Przykładowy krok',
  ownerType: 'MyMove',
  done: false,
  sortOrder: 0,
  createdAt: ts,
  updatedAt: ts,
  ...patch,
})

/** useSortable wymaga kontekstu DnD nawet w pojedynczym rzędzie. */
const sortableDecorator = (Story: () => React.ReactNode) => (
  <div className="max-w-xl p-4">
    <DndContext>
      <SortableContext items={['act-story']} strategy={verticalListSortingStrategy}>
        <ul className="space-y-1">
          <Story />
        </ul>
      </SortableContext>
    </DndContext>
  </div>
)

const meta: Meta<typeof SortableActionRow> = {
  title: 'Workbench/ActionRow',
  component: SortableActionRow,
  decorators: [sortableDecorator],
}
export default meta

type Story = StoryObj<typeof SortableActionRow>

export const MyMoveTodo: Story = {
  render: () => <SortableActionRow action={mkAction({ label: 'Uzupełnić sekcję KPI liczbami z analytics' })} onRequestDelete={() => {}} />,
}

export const DoneStruckThrough: Story = {
  render: () => (
    <SortableActionRow
      action={mkAction({ label: 'Zebrać insighty z 5 wywiadów', done: true })}
      onRequestDelete={() => {}}
    />
  ),
}

export const WaitingWithFutureDate: Story = {
  render: () => (
    <SortableActionRow
      action={mkAction({ label: 'Przejść makietę z Anią z zespołu deweloperskiego', ownerType: 'WaitingOn', followUpDate: dkey(3) })}
      onRequestDelete={() => {}}
    />
  ),
}

export const WaitingOverdue: Story = {
  render: () => (
    <SortableActionRow
      action={mkAction({ label: 'Potwierdzić budżet u finansów', ownerType: 'WaitingOn', followUpDate: dkey(-2) })}
      onRequestDelete={() => {}}
    />
  ),
}

export const DoneNotScaredByPastDate: Story = {
  render: () => (
    <SortableActionRow
      action={mkAction({ label: 'Akcja skończona mimo daty w przeszłości', ownerType: 'WaitingOn', followUpDate: dkey(-5), done: true })}
      onRequestDelete={() => {}}
    />
  ),
}
