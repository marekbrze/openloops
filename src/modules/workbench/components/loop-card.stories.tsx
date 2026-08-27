import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import type { Loop, LoopAction, Tag } from '@/modules/data-layer'
import { LoopCard } from './loop-card'

/* Fixtures prezentacyjne — poza bazą, deterministyczne stany kart (MODULES.md priority areas). */
const ts = new Date().toISOString()
const pad = (n: number) => String(n).padStart(2, '0')
const dkey = (offset = 0) => {
  const d = new Date(Date.now() + offset * 86_400_000)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const tagsPool: Tag[] = [
  { id: 'tag-ux', name: 'UX', createdAt: ts, updatedAt: ts },
  { id: 'tag-marketing', name: 'marketing', createdAt: ts, updatedAt: ts },
]

const mkLoop = (patch: Partial<Loop> = {}): Loop => ({
  id: 'loop-demo',
  title: 'Redesign onboardingu w aplikacji',
  status: 'open',
  sortOrder: -1,
  goalText: '',
  tagIds: [],
  createdAt: ts,
  updatedAt: ts,
  ...patch,
})

const meta: Meta<typeof LoopCard> = {
  title: 'Workbench/LoopCard',
  component: LoopCard,
}
export default meta

type Story = StoryObj<typeof LoopCard>

/** Wrapper z lokalnym stanem zaznaczenia — karta reaguje na klik jak w aplikacji. */
function Interactive(props: Omit<Parameters<typeof LoopCard>[0], 'selected' | 'onSelect'>) {
  const [selected, setSelected] = useState(false)
  return (
    <div className="max-w-md p-4">
      <LoopCard {...props} selected={selected} onSelect={() => setSelected((v) => !v)} />
    </div>
  )
}

export const WithProgress: Story = {
  args: undefined,
  render: () => (
    <Interactive
      loop={mkLoop()}
      tagsPool={tagsPool}
      actions={[
        { id: 'a1', loopId: 'loop-demo', label: 'Zebrać insighty', ownerType: 'MyMove', done: true, sortOrder: 0, createdAt: ts, updatedAt: ts },
        { id: 'a2', loopId: 'loop-demo', label: 'Makieta weryfikacji', ownerType: 'MyMove', done: false, sortOrder: 1, createdAt: ts, updatedAt: ts },
        { id: 'a3', loopId: 'loop-demo', label: 'Przegląd z devem', ownerType: 'WaitingOn', followUpDate: dkey(3), done: false, sortOrder: 2, createdAt: ts, updatedAt: ts },
      ] as LoopAction[]}
      todayKey={dkey(0)}
      onRename={() => {}}
      onAttachTag={() => {}}
      onDetachTag={() => {}}
      onCreateTagAndAttach={() => {}}
    />
  ),
}

export const WaitingOnly: Story = {
  render: () => (
    <Interactive
      loop={mkLoop({ title: 'Umowa z podwykonawcą graficznym' })}
      tagsPool={tagsPool}
      actions={[
        { id: 'b1', loopId: 'loop-demo', label: 'Czekać na kontrpropozycję stawki', ownerType: 'WaitingOn', done: false, sortOrder: 0, createdAt: ts, updatedAt: ts },
      ] as LoopAction[]}
      todayKey={dkey(0)}
      onRename={() => {}}
      onAttachTag={() => {}}
      onDetachTag={() => {}}
      onCreateTagAndAttach={() => {}}
    />
  ),
}

export const EmptySteps: Story = {
  render: () => (
    <Interactive
      loop={mkLoop({ title: 'Case study openloops w portfolio' })}
      tagsPool={tagsPool}
      actions={[]}
      todayKey={dkey(0)}
      onRename={() => {}}
      onAttachTag={() => {}}
      onDetachTag={() => {}}
      onCreateTagAndAttach={() => {}}
    />
  ),
}

export const OverdueFollowUp: Story = {
  render: () => (
    <Interactive
      loop={mkLoop({ title: 'Brief kampanii Q4', tagIds: ['tag-marketing'] })}
      tagsPool={tagsPool}
      actions={[
        { id: 'c1', loopId: 'loop-demo', label: 'Potwierdzić budżet u finansów', ownerType: 'WaitingOn', followUpDate: dkey(-1), done: false, sortOrder: 0, createdAt: ts, updatedAt: ts },
      ] as LoopAction[]}
      todayKey={dkey(0)}
      onRename={() => {}}
      onAttachTag={() => {}}
      onDetachTag={() => {}}
      onCreateTagAndAttach={() => {}}
    />
  ),
}

export const MyMoveComplete: Story = {
  render: () => (
    <Interactive
      loop={mkLoop({ title: 'Retrospektywa design systemu' })}
      tagsPool={tagsPool}
      actions={[
        { id: 'e1', loopId: 'loop-demo', label: 'Zebrać oceny od zespołu', ownerType: 'MyMove', done: true, sortOrder: 0, createdAt: ts, updatedAt: ts },
        { id: 'e2', loopId: 'loop-demo', label: 'Umówić sesję retro', ownerType: 'WaitingOn', done: false, sortOrder: 1, createdAt: ts, updatedAt: ts },
      ] as LoopAction[]}
      todayKey={dkey(0)}
      onRename={() => {}}
      onAttachTag={() => {}}
      onDetachTag={() => {}}
      onCreateTagAndAttach={() => {}}
    />
  ),
}
