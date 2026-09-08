# [0037] - Feature „żaba" (Eat That Frog) zaplanowany
**Date**: 2026-09-08
**Status**: Accepted
## Context
Feature request: oznaczanie odkładanych zadań i wątków jako „żaby" (inspiracja „Eat This Frog"). Żaba dokładana do kolejki Teraz ma lądować na samej górze; wątek-żaba na górze listy wątków; zielona ikona żaby. Potrzebny impact mapping po pełnym łańcuchu proto (projekt po design/polish).
## Decision
Zaplanowano w docs/changes/zaba.md. Dotyka modułów data-layer, workbench, now, tasks (nowy moduł: nie). Semantyka ustalona w wywiadzie: **wiele żab naraz**, **auto-zdjęcie po done / domknięciu / porzuceniu** (cofnięcie nie przywraca), **skok na górę zamiast trwałego przypięcia** — drag & drop pozostaje jedynym źródłem porządku (spójne z ADR-0003/0023). Implementacja: `isFrog` bez indeksu (bez bumpu schematu Dexie), decyzja front-wstawiania wewnątrz `nowRepo.add` (jeden punkt, zero zmian call-site), własny `FrogIcon` (lucide nie ma żaby) w kolorze z rampy success (hue 150). MVP obejmie przełączniki i glify na 4 powierzchniach; 4 pozycje odłożone. Routing: dokumenty → residual direct edits → proto-edgecases/harden; design/polish tylko przy szlifie.
## Impact
Kroki 2–4 planu działają na tym dokumencie. Zmiana scope → re-run proto-feature. Modyfikuje regułę ADR-0023 (doklejanie na koniec) dla żab — semantycznie: żaba to wyjątek odkładania, nie nowy system sortowania.
