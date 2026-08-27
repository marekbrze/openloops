# [0018] - Journal edge-case baseline

**Date**: 2026-08-27
**Module**: journal
**Status**: Accepted

## Context
Prototyp dziennika obsłużył happy paths (lofi `80b1590`), ale nie był stres-testowany pod kątem stanów brzegowych.

## Decision
Audyt przeprowadzony do `docs/modules/journal-edgecases.md`. Znaleziono **9 luk** (🔴 1 · 🟡 3 · 🟢 5); wszystkie 6 przypadków ze specu było już obsłużonych. Top priorytety: (1) **wpis-ghost przy odhaczeniu następnego dnia** — `data-layer` czyści tylko wpis dzisiejszej daty, fałszując „bilans zawsze realny”; (2) brak powierzchni błędu odczytu mid-session; (3) zmiany bilansu nieogłaszane czytnikom ekranu.

## Impact
proto-harden implementuje priority list (#1–#4 obowiązkowe, 🟢 tanie opcjonalne). Luka #1 wymaga zmiany w `data-layer/repositories` (poza plikami journalu) — oczekiwane i uzasadnione, bo workbench jest jedynym pisarzem `DayEntry`.
