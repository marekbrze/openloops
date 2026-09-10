# [0042] - Bug: drag kolejek tylko w osi pionowej — zdiagnozowany
**Date**: 2026-09-10
**Status**: Accepted
## Context
Bug report z widoku today (Teraz): przeciąganie zadania „aktywuje jakiś kontener” i pozwala przesuwać wiersz w prawo; oczekiwany wyłącznie ruch góra-dół. Potrzebna diagnoza root cause przed fixem.
## Decision
Zdiagnozowano w docs/changes/drag-poziomy-w-kolejkach.md. Root cause: **logic error** — w sortable dnd-kit podniesiony wiersz dostaje surową deltę kursora (X+Y), a `verticalListSortingStrategy` rozsuwa tylko pozostałe wiersze; ograniczenie osi wymaga `modifiers` na DndContext, których projekt nie używa (pakiet `@dnd-kit/modifiers` nie był zależnością). Severity 🟡. Routing: direct edit (1 zależność + `modifiers={[restrictToVerticalAxis]}` na 3 DndContextach: now-screen, loop-list-column, action-panel); regression sites: keyboard sensor (nietknięty), handleDragEnd (nietknięty), collision detection closestCenter (modyfikatory uwzględniane).
## Impact
Fix implementowany z dokumentu zmiany; semantyka speców (reorder kolejki/wątków/akcji) doprecyzowana o „tylko oś pionowa”. Gdyby fix ujawnił głębszą przyczynę — re-run proto-bug.
