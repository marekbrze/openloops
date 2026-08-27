import type { Loop } from '@/modules/data-layer'
import type { ScenarioData } from './types'

const ts = new Date().toISOString()

const loops: Loop[] = [
  {
    id: 'loop-pierwszy',
    title: 'Mój pierwszy otwarty wątek',
    status: 'open',
    sortOrder: -1,
    goalText: '',
    createdAt: ts,
    updatedAt: ts,
  },
]

/** Jeden nagły wątek bez rozpisanych kroków — stan „rozpisz kroki…”. */
export function minimalScenario(): ScenarioData {
  return { loops, actions: [], dayEntries: [] }
}
