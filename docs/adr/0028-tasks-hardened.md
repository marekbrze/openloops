# [0028] - Tasks prototype hardened + toasty w top layer

**Date**: 2026-08-27
**Module**: tasks
**Status**: Accepted

## Context
Modal „Wybierz zadania" działał na happy paths; audyt (ADR-0026, `tasks-edgecases.md`) wskazał 6 luk. Kluczowa: baner porażki zapisu renderował się w rootcie App **pod** top layerem natywnego `showModal()` — nieudany pick/unpick milczał do zamknięcia modala. Ten sam niemy błąd czekał w modalu domknięcia wątku (workbench), którego komunikat błędu zakładano widoczny.

## Decision
(1) **Systemowa naprawa**: stack `AppNotices` wchodzi do top layer przez `popover="manual"` + `showPopover()` gdy są komunikaty — niemodalny (bez blokady strony, bez kradzieży Esc, bo manual-popover nie rejestruje close-watchera), z łagodną degradacją do fixed div bez wsparcia API. (2) Licznik „N do zrobienia" renderowany dopiero z danymi. (3) Nagłówek grupy `min-w-0 truncate` + `title=`. (4) `title=` na etykietach zadań. (5) Wspólny retry-token odgrzewa katalog i członkostwo; porażka członkostwa pokazuje kartę retry. Story: `Tasks/CatalogueReadError`. Odroczone: gate liveQuery zamkniętego modalu, in-flight disable (konwencja workbench #13).

## Impact
Porażka zapisu jest zawsze widoczna — w modalu Zadań, nad każdym przyszłym modalem aplikacji i w workbench. Happy path bez zmian; układ nagłówka modalu stabilny także bez licznika.
