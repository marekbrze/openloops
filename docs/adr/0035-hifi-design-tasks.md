# [0035] - Hi-fi design applied to tasks

**Date**: 2026-08-28
**Module**: tasks (modal „Wybierz zadania")
**Status**: Accepted

## Context
Modal Zadania był neutralnym lo-fi na położonej warstwie tokenów (ADR-0032); przełącznik Teraz został już ujednolicony między modułami w ADR-0033.

## Decision
Wyrównanie modułu do DESIGN.md: **matte** — `shadow-sm` usunięty z wierszy katalogu, jeden sygnał hover (`bg-muted/60`, spójny z wierszami now/workbench); **skala typograficzna** — `text-[11px]` ×3 → `text-xs` (bilans done/total grupy, typ akcji, pill overdue); **semantyka** — „po terminie" z destructive na warning (spójnie z ADR-0032/0033). Interakcje, stany puste, karta błędu i disabled-for-done nietknięte — zweryfikowane screenshotami light/dark z podjętą pozycją (kolejka pod spodem rośnie live).

## Impact
Wszystkie 4 moduły są hi-fi na wspólnej warstwie tokenów. proto-polish = finalny pass (kontrast detali, stany interakcji, a11y — ostatnie 5%).
