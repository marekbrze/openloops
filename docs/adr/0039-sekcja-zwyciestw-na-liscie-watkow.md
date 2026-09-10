# [0039] - Sekcja „Zwycięstwa” na liście wątków

**Date**: 2026-09-10
**Module**: workbench
**Status**: Accepted

## Context
Po zdjęciu pasa progresu (ADR-0038) lewa kolumna nie pokazuje żadnego śladu „ile już zrobione”. User: przy liczniku otwartych wątków chce małą ikonę pucharu z listą zrobionych zadań — zwycięstw. Pojęcie istnieje w domenie: skończona akcja = małe zwycięstwo (dziennik, GLOSSARY).

## Decision
Zwijana sekcja **„Zwycięstwa”** na dole lewej kolumny, **nad** „Domkniętymi i porzuconymi” (celebracja przed archiwum). Nagłówek w konwencji sekcji zamkniętych: chevron + zielony puchar (`Trophy`, rampa success — „zielone = wygrane”) + licznik w badge. Po rozwinięciu lista **wszystkich** zrobionych akcji (wątki otwarte i domknięte), najświeższe pierwsze (`doneAt` malejąco): label akcji, tytuł wątku, data odhaczenia. Sekcja jest **read-only** — tu się nie odhacza ani nie usuwa; historią i bilansem rządzi dziennik, wierszami akcji — panel. Zwinięta domyślnie; zero wpływu na layout do momentu rozwinięcia.

## Impact
`wins-section.tsx` (nowy), `loop-list-column.tsx` (pochodna `wins` z już istniejącej kwerendy `useAllActions` + tytuły z list otwartych/zamkniętych — zero nowych kwerend Dexie). Spec: `workbench.md`.
