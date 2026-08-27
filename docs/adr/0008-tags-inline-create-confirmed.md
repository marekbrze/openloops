# [0008] - Potwierdzenie modelu tagów: wolne wpisywanie + globalna pula

**Date**: 2026-08-27
**Module**: workbench
**Status**: Superseded (2026-08-27 — moduł tags wycofany decyzją użytkownika; kod, encja `Tag` i tabela `tags` usunięte, patrz MODULES.md)

## Context
Otwarte pytanie z PROJECT.md: tagi swobodnie wpisywane czy zarządzana lista? Deepen przyjęło swobodne + globalny rename/remove; decyzja czekała na potwierdzenie w detail/lofi.

## Decision
Potwierdzone: chipy tagów na karcie/w panelu z wolnym wpisywaniem — pierwsze użycie nowej nazwy tworzy tag we wspólnej puli (kolor auto z palety); dropdown podpowiada istniejące. Globalny rename/delete zostaje w module tags (osobny mini-widok, później).

## Impact
PROJECT.md: pytanie zamknięte. ACTIONS.md bez zmian merytorycznych (Create Tag już tak opisane). Moduł tags: zakres potwierdzony.
