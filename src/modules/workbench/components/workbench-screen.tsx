import { useEffect, useRef, useState } from 'react'
import { useClosedLoops, useOpenLoops } from '../hooks/use-workbench'
import { LoopListColumn } from './loop-list-column'
import { ActionPanel } from './action-panel'

/**
 * Ekran główny: stały układ dwukolumnowy 50/50 (decyzja layoutu lofi).
 * Prawy panel bez zaznaczenia pokazuje placeholder-zachętę (ADR-0005), nigdy skoku layoutu.
 */
export function WorkbenchScreen() {
  const openLoops = useOpenLoops()
  const closedLoops = useClosedLoops()
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const autoSelectDoneRef = useRef(false)

  // Happy path z PROJECT.md: najczęściej pracuje się na topowym wątku — zaznacz go raz przy starcie.
  useEffect(() => {
    if (!openLoops || openLoops.length === 0) autoSelectDoneRef.current = false
    else if (!autoSelectDoneRef.current && !selectedId) {
      setSelectedId(openLoops[0].id)
      autoSelectDoneRef.current = true
    }
  }, [openLoops, selectedId])

  const firstRun = Boolean(openLoops && closedLoops && openLoops.length === 0 && closedLoops.length === 0)

  return (
    <div className="grid h-full min-h-0 grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="min-h-0 overflow-hidden lg:h-full">
        <LoopListColumn selectedId={selectedId} onSelectLoop={setSelectedId} />
      </div>
      <div className="min-h-0 overflow-hidden lg:h-full">
        <ActionPanel loopId={selectedId} firstRun={firstRun} />
      </div>
    </div>
  )
}
