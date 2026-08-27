# [0014] - Tydzień pon–nd z kotwicą „dziś"

**Date**: 2026-08-27
**Module**: journal
**Status**: Accepted

## Context
Agregacja do tygodnia wymaga ustalenia granic zakresu i punktu startowego widoku.

## Decision
Tydzień = poniedziałek→niedziela (konwencja polskiego kalendarza; `Intl` locale pl). Widok otwiera się zawsze na bieżącym tygodniu; przycisk „Dziś" wraca do niego z dowolnego miejsca (no-op, gdy już tam jesteśmy).

## Impact
docs/modules/journal.md (Flows, Screens). Helper zakresu tygodnia powstanie w module journal (data-layer dostaje tylko listę kluczy dni — API bez zmian).
