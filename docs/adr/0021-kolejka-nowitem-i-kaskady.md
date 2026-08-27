# [0021] - Kolejka Teraz = encja NowItem z kaskadowym sprzątaniem

**Date**: 2026-08-27
**Module**: data-layer, now
**Status**: Accepted

## Context
Kolejka Teraz wskazuje akcje (`LoopAction`) spoza porządku wątku. Potrzebna trwała, ręcznie układana lista. Pytania: czy przechowywać status „wybrano" na samej akcji, i co z pozycjami, których źródło znika.

## Decision
Nowa encja **`NowItem`** (tabela `nowItems`, wersja schematu 3): `id = now:${actionId}` (deterministyczne — toggle jest idempotentny), `actionId`, `sortOrder`, `addedAt`. Żadnych pól kopiuje treść — lista zawsze żyje na danych źródłowych (liveQuery join actions+loops).

**Kaskady (koniec z ghost-pozycjami — lekcja ADR-0019):**
- usunięcie akcji → usuwa jej `NowItem`,
- twarde usunięcie wątku / domknięcie / porzucenie → usuwa `NowItem` wszystkich jego akcji (akcje zamkniętego wątku nie są już wykonalne),
- reopen **nie odtwarza** zdjętych pozycji (analogia do ADR-0003: przechwycenie ≠ przywrócenie).

## Impact
`src/modules/data-layer` (types, db v3, `nowRepo`, transakcje kaskadowe obejmują `db.nowItems`). Moduły UI czytają przez żywe kwerendy; „zdejmij zrobione" masowo = `nowRepo.removeByActionIds`.
