# [0020] - Teraz jako widok domyślny i pierwsza zakładka

**Date**: 2026-08-27
**Module**: shell (App/navigation), now
**Status**: Accepted

## Context
Aplikacja startowała na workbench. Użytkownik deklaruje ekran Teraz jako „główny ekran pracy": wchodzi w aplikację po to, by zobaczyć co jest do zrobienia dziś, a nie by zarządzać wątkami.

## Decision
`ViewId` rozszerzone o `now` i `tasks`; kolejność zakładek: **Teraz · Zadania · Workbench · Dziennik**. Stan początkowy shella = `now`. Workbench traci rolę lądowania, zachowuje pełną funkcję autorską.

## Impact
`src/lib/navigation.ts`, `src/App.tsx`. Toasty akcji (`openView`) nadal prowadzą do dziennika/workbencha — nawigacja zdarzeniowa nie zmienia decyzji o starcie.
