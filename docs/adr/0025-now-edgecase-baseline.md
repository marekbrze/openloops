# [0025] - Now edge-case baseline

**Date**: 2026-08-27
**Module**: now
**Status**: Accepted

## Context
Ekran Teraz (ADR-0020..0023) i modal „Wybierz zadania" (ADR-0024) działają na happy paths, ale nie były stres-testowane pod kątem stanów brzegowych.

## Decision
Audyt przeprowadzony do `docs/modules/now-edgecases.md` (modal audytowany osobno w `tasks-edgecases.md`, ADR-0026). Wszystkie 8 przypadków ze specu było już obsłużonych. Nowe luki: **7** (🔴 0 · 🟡 2 · 🟢 5). Top priorytety: (1) **wyścig stanu pustego** — `openLoopCount` jeszcze nieczytelny wybiera wariant „świeży świat" i CTA do workbench dla użytkownika, który ma wątki; (2) **brak guardy −1 w drag-endzie** — jedyna droga do zapisania fałszywego porządku dnia przez `nowRepo.reorder`; (3) odczyty pomocnicze (`usePickedActionIds`, `useOpenLoopCount`) bez obsługi porażki i bez re-armu przez retry.

## Impact
proto-harden implementuje priority list (#1–#3, 🟢 tanie opcjonalne). Luka #3 dotyczy hooka współdzielonego z modułem tasks — zmiana w jednym miejscu, dwa moduły. Pozycje #7–#8 świadomie odroczone (in-flight disable jak w workbench #13; rolowanie dnia sprzeczne z ADR-0023 — wróci po testach userów).
