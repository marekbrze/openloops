# [0026] - Tasks edge-case baseline

**Date**: 2026-08-27
**Module**: tasks
**Status**: Accepted

## Context
Modal „Wybierz zadania" (ADR-0022, osadzenie na Teraz wg ADR-0024) działa na happy paths, ale nie był stres-testowany pod kątem stanów brzegowych.

## Decision
Audyt przeprowadzony do `docs/modules/tasks-edgecases.md`. Wszystkie 8 przypadków ze specu było już obsłużonych. Nowe luki: **6** (🔴 0 · 🟡 1 · 🟢 5). Priorytet #1: **toast porażki mutacji niewidoczny nad modalem** — `guard` → `notify.error` renderuje baner w rootcie App, a natywny `showModal()` siedzi w top layer przeglądarki, więc nieudany pick/unpick milczy do zamknięcia modala. Pozostałe: licznik „0 do zrobienia" przy szkielecie, truncation nagłówka grupy i etykiet bez `title=`, retry nie odgrzewa kwerendy członkostwa, liveQuery modala żywe przy zamkniętym dialogu.

## Impact
proto-harden implementuje priority list. Luka #1 to naprawa systemowa w shared (notices dostępne nad top layer, np. własny `<dialog>`/popover) albo inline-error w modalu — decyzja z projektantem; zwróci się w każdym przyszłym modalu aplikacji. Luka #5 współdzielona z modułem now (ADR-0025) przez `usePickedActionIds`.
