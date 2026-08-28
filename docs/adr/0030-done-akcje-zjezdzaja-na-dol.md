# [0030] - Zrobione akcje auto-sortują się na dół listy

**Date**: 2026-08-28
**Module**: workbench
**Status**: Accepted

## Context
Lista akcji w panelu miała czysto ręczną kolejność (drag & drop, ADR priority area). Po odhaczeniu kilku kroków zrobione mieszały się z otwartymi — plan wykonania tracił czytelność, a oko musiało odfiltrowywać skończone pozycje.

## Decision
Panel akcji wyświetla akcje w kolejności pochodnej: **niezrobione wg ręcznego sortOrder, potem zrobione wg ręcznego sortOrder**. Zaznaczenie done natychmiast „zatapia" wiersz na dole grupy; odhaczenie przywraca wiersz na jego dawne miejsce wśród otwartych. Drag & drop działa dalej — ręczna kolejność jest pamiętana w `sortOrder` wewnątrz każdej grupy, a auto-sort jest widokowy (nie zapisuje przestawienia). Próba przeciągnięcia zrobionej akcji nad otwartą i tak wraca na dół przy najbliższym renderze. Cel pozostaje przypięty jako ostatni element.

## Impact
Spec `workbench.md` (flow „Dzień pracy", tabela akcji, ekrany). Kod: `action-panel.tsx` — pochodna `orderedActions` karmi `SortableContext`, render i `handleDragEnd`; data-layer bez zmian (repo pozostaje źródłem ręcznej kolejności).
