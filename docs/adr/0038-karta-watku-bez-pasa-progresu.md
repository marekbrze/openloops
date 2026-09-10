# [0038] - Karta wątku bez pasa progresu

**Date**: 2026-09-10
**Module**: workbench
**Status**: Accepted (supersedes presentation of ADR-0006)

## Context
Karty listy „Wątki otwarte” pokazywały pasek progresu z licznikiem done/total akcji „mój ruch” (ADR-0006). User po testach hi-fi: lista ma być lżejsza — zrezygnować z pasa, zostawić tylko licznik otwartych wątków.

## Decision
**Pasek progresu i licznik `done/total` znikają z karty wątku.** Nagłówek kolumny zostaje z samym licznikiem otwartych wątków. Po kartach zostają wyłącznie etykiety stanu i wskaźniki: „rozpisz kroki…” (brak akcji), „cały czeka na innych · N” (same WaitingOn), „czeka” (blokada częściowa), „N po terminie”. Karta wątku rozpisanego na „mój ruch” nie pokazuje żadnej pochodnej — praca mówi sama przez siebie. Arytmetyka done/total „mój ruch” przestaje istnieć w UI; jedynym miejscem liczenia skończonych akcji jest dziennik (małe zwycięstwa) i sekcja Zwycięstwa (ADR-0039).

## Impact
`workbench-ui.ts` (`ProgressView` → `CardStatusView`, `getProgressView` → `getCardStatusView`), `loop-card.tsx` (`ProgressArea` → `CardStatusArea`), stories. Specy: `workbench.md`, `MODULES.md`, `GLOSSARY.md`. ADR-0006 pozostaje historyczny — rozstrzygał prezentację bara, którego już nie ma.
