# [0009] - Konwencja klik-to-edit dla tekstów

**Date**: 2026-08-27
**Module**: workbench
**Status**: Accepted

## Context
Edycja tytułu wątku, etykiety akcji i celu wymaga spójnej konwencji; dialogi spowalniałyby drobne poprawki.

## Decision
Klik w tekst (tytuł wątku, etykieta akcji, cel) zamienia go w pole: Enter zapisuje, Esc anuluje. Dedykowane kontrolki tylko dla danych strukturalnych: przełącznik typu akcji (mój ruch ⇄ czekam), data dopytania, checkbox done.

## Impact
ACTIONS.md (Edit Loop / Edit Action). Lo-fi: wspólny komponent edycji inline.
