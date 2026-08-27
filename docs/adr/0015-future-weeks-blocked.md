# [0015] - Nawigacja nie wchodzi w przyszłe tygodnie

**Date**: 2026-08-27
**Module**: journal
**Status**: Accepted

## Context
Strzałka → mogłaby prowadzić do przyszłych tygodni — ale ich stan (pusto) niczego nie znaczy i wyglądałby jak błąd danych albo fałszywy empty-state.

## Decision
Dziennik pokazuje wyłącznie historię i teraźniejszość: → jest nieaktywny, gdy wyświetlany jest bieżący tydzień. Wstecz (←) bez ograniczeń.

## Impact
docs/modules/journal.md (Navigate Weeks, Edge Cases). Eliminuje całą klasę „pustych przyszłości" przed audytem edgecases.
