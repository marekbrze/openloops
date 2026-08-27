# [0017] - Bilans pokazuje 0 · 0 uczciwie

**Date**: 2026-08-27
**Module**: journal
**Status**: Accepted

## Context
Pusty tydzień można było zamaskować (ukryć blok bilansu, komunikat zastępczy bez liczb). Maskowanie kłóciłoby się z filozofią deepen: „bilans dnia zawsze realny".

## Decision
Blok bilansu jest zawsze widoczny — także jako 0 małych · 0 większych, z neutralną notką („ten tydzień nie zapisał żadnych zwycięstw"). Pustość jest faktem, nie porażką ani sukcesem.

## Impact
docs/modules/journal.md (Vision, Empty state). Spójność z zasadą workbench „zero fałszywego progresu"; jeden wzorzec dla tygodnia pustego i pełnego.
