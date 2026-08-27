# [0023] - Kolejka: doklejanie na koniec, zrobione zostają na liście

**Date**: 2026-08-27
**Module**: now
**Status**: Accepted

## Context
Workbench przy quick capture stawia nowe na górze (ADR-0003). Dla kolejki „co robię teraz" góra znaczy *następne w kolejce* — dorzucenie nowego zadania nie może przewrócić ułożonego planu. Drugie pytanie: co z odhaczonymi pozycjami.

## Decision
- Nowe pozycje doklejają się na **koniec** kolejki (`sortOrder = length`); kolejność ustala wyłącznie drag & drop (numeracja widoczna w UI).
- Akcja odhaczona **zostaje** w kolejce jako skreślona — zdjęcie to świadoma decyzja użytkownika (pojedynczo albo masowo). Auto-znikanie po odhaczeniu zabija kontekst „co właśnie skończyłem".
- Masowe sprzątnięcie: przycisk „Zdejmij zrobione (n)" pod listą, gdy ≥1 pozycji jest done. Wobec twardego usunięcia źródła kaskada ADR-0021 czyści mimo wszystko automatycznie.

## Impact
`nowRepo.add` (append), `now-screen` (masowe CTA), stories pokrywają stan mieszany zrobione/niezrobione.
