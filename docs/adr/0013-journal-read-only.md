# [0013] - Dziennik wyłącznie czyta — zero mutacji DayEntry

**Date**: 2026-08-27
**Module**: journal
**Status**: Accepted

## Context
Zastanawiano się, czy dziennik powinien pozwalać poprawić/uskunąć wpis (np. przypadkowe odhaczenie, literówka w snapshocie). Dotknięcie wpisów uczyniłoby bilans konfigurowalnym, a więc podatnym na zafałszowanie.

## Decision
Dziennik jest wyłącznie czytelnikiem `DayEntry` — brak akcji tworzenia/edycji/usuwania. Jedyną drogą zmiany bilansu pozostaje źródło zdarzenia w workbench (odhaczenie akcji / reopen… reopen celowo nie kasuje historii).

## Impact
docs/modules/journal.md (Actions: tylko nawigacja i czytanie). Modularna zasada „workbench jedynym pisarzem" zostaje twarda; UI dziennika nie potrzebuje żadnej logiki zapisu.
