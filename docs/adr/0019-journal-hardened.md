# [0019] - Journal prototype hardened

**Date**: 2026-08-27
**Module**: journal
**Status**: Accepted

## Context
Prototyp dziennika obsłużył happy paths, a audyt (`docs/modules/journal-edgecases.md`, ADR-0018) wykazał 9 luk — w tym naruszenie istoty produktu: cofnięcie odhaczenia następnego dnia zostawiało ghost-wpis zwycięstwa.

## Decision
Zaimplementowano 7 z 9 luk:
- **Semantyka zwycięstw domknięta przez dzień** (luka #1): akcja niezrobiona ⇒ żadnego dnia nie było od niej zwycięstwa — czyszczenie po indeksie `actionId` we wszystkich datach. To świadome rozszerzenie decyzji deepen („uncheck usuwa swój wpis” liczony dla dnia zdarzenia); wersję zachowującą historyczne wpisy można przywrócić, jeśli userzy wskażą wartość retro.
- Porażka odczytu ma kartę `alert` z „Spróbuj ponownie” (sentinel w liveQuery, retry-token).
- Rekord o nieznanym `kind` renderuje się jako neutralny „Wpis”, bez wysypania aplikacji; mini-liczniki dnia liczą wyłącznie znane rodzaje.
- Bilans ogłaszany czytnikom konstrukcją bezodmienną (sr-only, `role="status"`).
- Szkielet tylko przy pierwszym renderze (anti-błysk między tygodniami), resync kotwicy przy powrocie widoczności karty (bez ruszania celowo przeglądanego przeszłego tygodnia), `[overflow-wrap:anywhere]` + `title`.

Odroczone świadomie: skróty klawiaturowe ←/→ (ryzyko kolizji z dnd/checkboxami przed testami userów), synchronizacja międzykartami (single-user single-tab z założenia). Hash-routing dziedziczony z decyzji workbench.

## Impact
Dziennik pokrywa ścieżki złe tak dobrze jak szczęśliwe; obietnica „bilans zawsze realny” jest prawdziwa także dla cofnięć między dniami. Smoke E2E potwierdza naprawę ghosta na realnej bazie IndexedDB.
