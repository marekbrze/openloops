# [0022] - Przełącznik „Teraz" jako druga kontrolka obok checkboxa

**Date**: 2026-08-27
**Module**: workbench, tasks
**Status**: Accepted

## Context
Checkbox jest zajęty znaczeniem „wykonane" (pisze dziennik). Dołączanie do kolejki Teraz musi być formą toggle (postulat użytkownika) — w jednym wierszu pojawiają się więc dwa przełączniki o różnych znaczeniach.

## Decision
- Checkbox = wykonane (bez zmian semantyki). Nowy przycisk-toggle „Teraz" (ikona listy + aria-pressed) dokłada/zdejmuje z kolejki; **disabled dla akcji done** (wpis done nie jest dalszym planem pracy).
- Lista Zadania to **katalog**: tylko wybór i czytanie (etykieta, typ mój ruch/czekam, data dopytania). Edycja tekstu, typów, usuwanie zostają w workbench — jedno miejsce mutacji struktury, zero zduplikowanych paneli.

## Impact
`SortableActionRow` (workbench) dostaje `PickForNowToggle`; katalog Zadania renderuje własne, uproszczone wiersze bez EditableText.
