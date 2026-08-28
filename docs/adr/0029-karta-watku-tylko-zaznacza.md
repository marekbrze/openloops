# [0029] - Karta wątku tylko zaznacza (bez klik-to-edit na liście)

**Date**: 2026-08-28
**Module**: workbench
**Status**: Accepted (amends ADR-0009)

## Context
ADR-0009 ujednolicił klik-to-edit dla wszystkich tekstów, łącznie z tytułem na karcie wątku w lewej kolumnie. W praktyce prototypu okazało się, że edycja na karcie koliduje z podstawowym gestem listy — kliknięciem w kartę, które ma **zaznaczać wątek**. Dwa akcje na tej samej powierzchni to ryzyko pomyłkowego wejścia w edycję zamiast nawigacji.

## Decision
Karta wątku w lewej kolumnie jest tylko przełącznikiem zaznaczenia — tytuł jest statyczny. Zmiana nazwy wątku odbywa się wyłącznie w nagłówku prawej kolumny (panel akcji), gdzie klik-to-edit zostaje. Wyjątek od konwencji ADR-0009 dotyczy tylko karty; tytuł panelu, etykieta akcji i cel edytują się jak dotychczas.

## Impact
ACTIONS.md (Edit Loop), spec `workbench.md` (zasady, ekrany, tabela akcji). Kod: `loop-card.tsx` bez `EditableText`/`onRename`, cała powierzchnia karty jednolicie klikalna.
