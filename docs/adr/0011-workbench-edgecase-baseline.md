# [0011] - Workbench: baseline audytu przypadków brzegowych

**Date**: 2026-08-27
**Module**: workbench
**Status**: Accepted

## Context
Lo-fi workbencha (commit `e25c86d`) obsługuje happy pathy; systematiczny stres-test jeszcze nie był robiony (proto-detail celowo zostawił go na później).

## Decision
Audyt zapisany w `docs/modules/workbench-edgecases.md`: 15 luk (🔴3 / 🟡5 / 🟢7). Najwyższe priorytety: ghost-panel zamkniętego wątku, brak powierzchni błędu IndexedDB, nieme odrzucenia mutacji (`void repo.x()`).

## Impact
proto-harden implementuje priority list z dokumentu; re-audyt po zmianach da świeży baseline. Bug plakietki overdue z pustą datą dopytania wykryty wcześniej i naprawiony w trakcie smoke-testu lofi.
