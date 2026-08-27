# [0010] - Porzuć/Usuń w menu ⋯ nagłówka panelu

**Date**: 2026-08-27
**Module**: workbench
**Status**: Accepted

## Context
Rozkład akcji cyklu życia w panelu: rzadkie i destrukcyjne akcje nie mogą konkurować z głównym CTA o uwagę i miejsce.

## Decision
W nagłówku prawego panelu: główne CTA „Domknij” + menu ⋯ zawierające „Porzuć” i „Usuń…”. W sekcji „Domknięte i porzucone” przy karcie: Reopen + Usuń…. Wariant trzech równorzędnych przycisków odrzucony.

## Impact
ACTIONS.md (Abandon/Delete/Reopen). Destrukcyjne akcje zawsze za potwierdzeniem (dialog usunięcia mówi, co znika, a co zostaje ze snapshotem).
