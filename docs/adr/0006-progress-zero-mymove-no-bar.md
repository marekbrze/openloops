# [0006] - Brak pasa progresu przy zerze akcji „mój ruch”

**Date**: 2026-08-27
**Module**: workbench
**Status**: Accepted

## Context
Priority area z MODULES.md: progres liczy wyłącznie akcje typu mój ruch. Wątek bez żadnej takiej akcji (pusty albo tylko „czekam na kogoś”) nie ma dzielnika — co pokazać?

## Decision
Bar **znika**; karta pokazuje etykietę stanu: „rozpisz kroki…” (brak akcji) albo „cały czeka na innych · N”. Zero sztucznego wypełnienia bara. Warianty „bar neutralny” i „liczone jako pełny” odrzucone.

## Impact
docs/modules/workbench.md (Edge Cases). Progres pozostaje udziałem done/total w ramach MyMove — arytmetyka z ENTITY_MAP/GLOSSARY bez zmian, tylko reguła prezentacji.
