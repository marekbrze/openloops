# [0024] - Katalog Zadań jako modal na ekranie Teraz

**Date**: 2026-08-27
**Module**: tasks, now
**Status**: Accepted

## Context
Zakładka „Zadania" okazała się zbędnym przystankiem: Teraz jest głównym ekranem pracy (ADR-0020), a dobieranie zadań to pod-akcja pracy dnia, nie osobna powierzchnia. Przeskok zakładką → powrót = dwa przejścia tam, gdzie wystarczy jeden modal. Decyzja użytkownika z 2026-08-27: „nie ma sensu trzymać tego ekranu oddzielnie".

## Decision
- Katalog zadań (grupy po wątku + przełącznik „Teraz") renderowany w **modalu `TaskPickerModal`** na ekranie Teraz, otwieranym przyciskiem „Wybierz zadania" (zawsze dostępnym w nagłówku; CTA stanu pustego otwiera ten sam modal).
- **Zakładka „Zadania" wycofana**: tab znika z tobaru, `ViewId` traci `'tasks'`, `TaskListScreen` usunięty. Moduł `tasks` zostaje jako komponent modalny osadzony w Teraz.
- Semantyka wyboru bez zmian (ADR-0022: tylko czytanie i wybór; `nowRepo` jedynym pisarzem, ADR-0023: doklejanie na koniec) — liveQuery odświeża modal i kolejkę jednocześnie.

## Impact
Granica ról katalog ↔ workbench nietknięta; znikają dwie referencje nawigacyjne (`EmptyQueue`, gałąź widoku). Stany katalogu (szkielet/błąd/dwa puste) przeniesione do modalu. Plan zmiany: `docs/changes/zadania-jako-modal.md`.
