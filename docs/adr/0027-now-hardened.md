# [0027] - Now prototype hardened

**Date**: 2026-08-27
**Module**: now
**Status**: Accepted

## Context
Ekran Teraz działał na happy paths, ale audyt (ADR-0025, `now-edgecases.md`) wskazał 7 luk — m.in. wyścig stanu pustego na ekranie lądowania i niezabezpieczony zapis reorderu.

## Decision
Zaimplementowano 5 stanów: (1) wariant stanu pustego wybierany dopiero na rozstrzygniętej liczbie otwartych wątków; (2) guarda −1 w `handleDragEnd` przed `nowRepo.reorder`; (3) sentinele `READ_ERROR` + wspólny retry-token dla `usePickedActionIds`/`useOpenLoopCount`, karta retry w stanie pustym; (4) `title=` przy uciętych tekstach; (5) `min-w-5` numeracji. Story: `Now/NowReadError`. Odroczone świadomie: in-flight disable (konwencja workbench #13), rolowanie dnia (sprzeczne z ADR-0023 — decyzja po testach userów), gate liveQuery zamkniętego modalu (koszt znikomy; proto-polish).

## Impact
Kolejka dnia nie zapisze już fałszywego porządku, a lądowanie nie mruga fałszywym CTA. Hook członkostwa zmienił kontrakt (sentinel) — rippling obejmął modal Zadań i panel workbench (`instanceof Set`). Happy path bez zmian.
