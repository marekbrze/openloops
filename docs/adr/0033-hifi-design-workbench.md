# [0033] - Hi-fi design applied to workbench

**Date**: 2026-08-28
**Module**: workbench (+ spójność przełącznika Teraz w tasks)
**Status**: Accepted

## Context
Workbench był neutralnym lo-fi na już-położonej warstwie tokenów (ADR-0032). DESIGN.md (ADR-0031) definiował kierunek; zostawały lo-fi-izmy per komponent.

## Decision
Wyrównanie modułu do DESIGN.md: **matte** — usunięte `shadow-sm` z kart wątków, wierszy akcji i formularza dodawania (hairline + subtelny hover `bg-muted/60`); **skala typograficzna** — wszystkie arbitralne `text-[11px]` → `text-xs`; **ban absolutny** — nagłówek celu bez uppercase/tracking-wide eyebrow (zwykły case + glyph Flag, separator `border-t` zamiast 2px); **semantyka** — znaczniki „po terminie" (karta wątku + pole daty) z destructive na **warning** (spójnie z ADR-0032), Trophy w modalu „Cel osiągnięty" z primary na **success** (zielony = zwycięstwo), ikona domkniętego wątku w sekcji zamkniętych → success; **słownictwo** — przełącznik „Teraz" (PickForNowToggle) ujednolicony w workbench i modalu Zadania: picked = `bg-primary/10 text-primary font-medium` (sky = członkostwo w kolejce dnia, odróżnione od neutralnego chipu typu akcji); jeden sygnał hover na karcie (usunięty `hover:border-ring/50`, ring tylko dla zaznaczenia). Interakcje, dane i stany nietknięte — zweryfikowane screenshotami (lista, zaznaczenie, modal domknięcia, dark).

## Impact
Workbench hi-fi i spójny z now; modal Zadania dziedziczy słownictwo przełącznika przed własnym przebiegiem designu. proto-polish = finalny pass.
