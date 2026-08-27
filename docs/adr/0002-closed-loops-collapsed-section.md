# [0002] - Sekcja „Domknięte i porzucone” na dole listy

**Date**: 2026-08-27
**Module**: workbench
**Status**: Accepted

## Context
Domknięte i porzucone wątki muszą pozostać osiągalne (Reopen, twarde usunięcie), ale lista otwarta jest codzienną mapą dnia i nie może być zagęszczona starymi tematami.

## Decision
Zwijana sekcja **„Domknięte i porzucone (N)”** na dole lewej kolumny, z licznikiem; rozwinięcie pokazuje karty ze znakiem statusu i akcjami Reopen / Usuń…. Otwarta lista zawiera wyłącznie status `open`.

## Impact
ACTIONS.md: Reopen/Delete mają określone miejsce dostępu. Data-layer: repo wymaga listowania nie-otwartych (dziś tylko `listOpen()`) — do dorobienia przy implementacji.
