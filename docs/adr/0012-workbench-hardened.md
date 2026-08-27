# [0012] - Workbench prototype hardened

**Date**: 2026-08-27
**Module**: workbench
**Status**: Accepted

## Context
Lo-fi obsługiwał happy pathy; audyt `docs/modules/workbench-edgecases.md` wykazał 15 luk (3 krytyczne), w tym ghost-panel zamkniętego wątku, brak powierzchni błędu IndexedDB i nieme porażki zapisów.

## Decision
Zaimplementowane stany hardeningu: guard statusu panelu, ekran bootstrap-error IndexedDB, wspólny wrapper mutacji z banerem błędu (`guard()`), double-submit guards, toast „większe zwycięstwo czeka w Dzienniku" z przejściem (decyzja użytkownika), skeletony initial-load, PL komunikaty screen-readera dla DnD, overflow chipów, obsługa ConstraintError przy tworzeniu tagu, wariant first-run placeholda.

Odroczone świadomie (z powodami w ewidencji): hash-routing/deep-link, beforeunload-gate draftu (kultura autosave), optimistic-disable checkboxa, limity długości pól.

Bez zmian modelu danych — żadnej nowej encji/akcji domenowej (kanał komunikatów jest warstwą UI).

## Impact
Prototype obsługuje ścieżki błędne tak rozmyślnie jak happy path; storybook ma stories dla nowych stanów (skeletony, placeholder first-run, toasty/baner). Warstwa wizualna pozostaje neutralnym lo-fi — kolejny krok to proto-brand → proto-design → proto-polish.
