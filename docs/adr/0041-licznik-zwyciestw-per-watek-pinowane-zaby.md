# [0041] - Licznik zwycięstw per wątek i żaby przypięte na szczycie

**Date**: 2026-09-10
**Module**: workbench
**Status**: Accepted (amends ADR-0037 for the loop list; supersedes remnant of ADR-0006)

## Context
Po zdjęciu pasa progresu (ADR-0038) karta rozpisanego wątku milczała — user chciał widzieć na workbench „co to za wątek, ile było zwycięstw i ile otwartych zadań zostało". Druga decyzja tej sesji: żaby mają być **zawsze** na początku listy — jednorazowy skok z ADR-0037 przegrywał po jednym przeciągnięciu, a żaba ma być stałym priorytetem, nie wystrojem. Trzecia: nowy wątek ma wskakiwać **poniżej** żab, nie na sam szczyt.

## Decision
1. **Licznik per wątek na karcie**: zielony puchar + liczba zrobionych akcji (zwycięstwa obu typów — jak w dzienniku; tinta success tylko przy wartości > 0, uczciwe zero bez zieleni) · liczba otwartych zadań z polską liczbą mnogą. Etykieta „cały czeka na innych · N" znika — licznik + wskaźnik „czeka" mówią to samo bez dedykowanego wariantu. `CardStatusView`: `counts`/`empty`; „rozpisz kroki…" zostaje.
2. **Żaby przypięte widokowo**: `useOpenLoops` sortuje stabilnie żaby przed resztą nad ręcznym `sortOrder`; wewnątrz obu grup rządzi dalej drag & drop. Przeciągnięcie żaby w dół jest możliwe, ale przy najbliższym renderze wraca nad nie-żaby (wzór auto-sortu z ADR-0030). **Amend ADR-0037 dla listy wątków**: „skok na górę" → „stała pinacja"; skok jednorazowy zostaje dla akcji-żab w kolejce Teraz.
3. **Nowy wątek poniżej żab**: `loopsRepo.add` bez zmian (minimalny `sortOrder`); przy widokowej pinacji daje to szczyt grupy nie-żab — dokładnie pod żabami. Baza nie zna pinacji; jeśli kiedykolwiek druga powierzchnia będzie jej potrzebować, decyzja ma być podjęta na poziomie widoku tej powierzchni.

## Impact
`use-workbench.ts` (`useOpenLoops`), `workbench-ui.ts` (`CardStatusView`, `getCardStatusView`), `loop-card.tsx` (`CardStatusArea`, `openTasksLabel`, `Trophy`), stories (+`AllDone`). Komentarze: `loopsRepo.add/setFrog`, `Loop.isFrog`. Specy: `workbench.md`, `MODULES.md`, `GLOSSARY.md`, `ACTIONS.md`, `ENTITY_MAP.md`.
