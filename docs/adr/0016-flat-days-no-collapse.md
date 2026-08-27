# [0016] - Płaskie dni bez zwijania

**Date**: 2026-08-27
**Module**: journal
**Status**: Accepted

## Context
Alternatywy dla listy dni: zwijane sekcje per dzień (accordeon) albo tylko dni z wpisami. Zwijanie dodaje interakcji tam, gdzie moduł ma być czytany jednym spojrzeniem; wycinanie pustych dni rozbije rytm tygodnia.

## Decision
Wszystkie 7 dni tygodnia zawsze renderowane w kolejności pon→nd. Dzień ze zwycięstwami = pełna karta z listą wpisów (godzina, rodzaj, snapshot); dzień pusty = pojedynczy wygaszony wiersz „brak zwycięstw". Zero stanów rozwinięcia do zapamiętania.

## Impact
docs/modules/journal.md (Screens, Browse Day Entries). Prostsza implementacja lo-fi i mniej edge-case'y UI (brak synchronizacji rozwinięć między tygodniami).
