# [0001] - Close Loop z modalem celebracyjnym

**Date**: 2026-08-27
**Module**: workbench
**Status**: Accepted

## Context
PROJECT.md przekazał do proto-detail: jak wygląda moment domknięcia w UI — klik przy celu czy osobna akcja w nagłówku? Moment domknięcia to priority area z MODULES.md: przejście open → closed ma być chwilą nagrody, a przepływ informacji do dziennika widoczny/nazwany.

## Decision
Przycisk **„Domknij”** w nagłówku prawego panelu akcji. Klik otwiera modal celebracyjny: „Cel osiągnięty” + tytuł wątku + notka, że wpis trafia do dziennika jako większe zwycięstwo; Confirm/Anuluj.

## Impact
ACTIONS.md: Close Loop zaktualizowane (CTA w nagłówku + modal). Wariant „prosty confirm bez ceremonii” i „przycisk przy celu” odrzucone.
