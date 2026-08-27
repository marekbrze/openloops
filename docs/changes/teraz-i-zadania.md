# Zmiana: „Teraz" + lista wszystkich zadań

**Data**: 2026-08-27 · **Status**: wdrożona
**Źródło**: cel użytkownika z 2026-08-27 (autorskie sformułowanie poniżej)

> „chcę stworzyć nowy moduł listy wszystkich zadań zgrupowanych po wątku. dodatkowo chcę mieć moduł Teraz. na liście wszystkich zadań i z ekranu workbench chcę móc oznaczyć zadanie (toggle) które doda zadania do ekranu Teraz. ekran Teraz ma być domyślnym ekranem po wejściu do aplikacji. ekran listy zadań ma być łatwym sposobem wybrania akcji do zrobienia. na ekranie Teraz muszę mieć opcje ustawiania kolejności. chce tam też mieć dzisiejszą datę z nazwą dnia tygodnia i aktualnym czasem — traktuję to jako główny ekran pracy."

## Zakres

Dwa nowe moduły UI + jedna nowa encja + integracje:

1. **now (Teraz)** — domyślny widok aplikacji: dzisiejsza data z dniem tygodnia, żywy zegar,
   ręcznie układana kolejka wybranych akcji (drag & drop), odhaczanie akcji w miejscu.
2. **tasks (Zadania)** — katalog wszystkich akcji otwartych wątków, pogrupowany per wątek;
   rola: szybki wybór „co robię dalej".
3. **Przełącznik „Teraz"** przy każdej akcji — dostępny na liście Zadania **i** w panelu akcji
   workbench; toggle dokłada/zdejmuje akcję z kolejki Teraz.

## Decyzje projektowe (skrót; pełne uzasadnienia w ADR)

| # | Decyzja | ADR |
|---|---------|-----|
| 1 | Teraz = widok startowy i pierwsza zakładka shellu | [ADR-0020](../adr/0020-teraz-domyślnym-widokiem.md) |
| 2 | Kolejka Teraz to encja `NowItem` (id = `now:${actionId}`) zręczona przez `nowRepo`; kaskadowe sprzątanie | [ADR-0021](../adr/0021-kolejka-nowitem-i-kaskady.md) |
| 3 | Przełącznik dołączania jest **drugą** kontrolką obok checkboxa (checkbox zawsze = wykonane); katalog Zadania tylko do odczytu i wyboru — edycja zostaje w workbench | [ADR-0022](../adr/0022-przelacznik-teraz-obok-checkboxa.md) |
| 4 | Nowe pozycje doklejają się na KONIEC kolejki; zrobione zostają na liście (skreślenie) aż do ręcznego zdjęcia / masowego „zdejmij zrobione" | [ADR-0023](../adr/0023-kolejka-doklejana-na-koniec.md) |

## Wpływ na istniejące moduły

- **data-layer**: tabela `nowItems` (wersja schematu 3), `nowRepo`, kaskady w
  `actionsRepo.remove` / `loopsRepo.remove` / `closeLoopWithWin` / `loopsRepo.abandon`.
  Semantyka Toggle Done bez zmian (dziennik nadal pisze się przy odhaczeniu — niezależnie
  od ekranu, na którym odhaczono).
- **workbench**: wiersz akcji dostaje przełącznik „Teraz"; resza bez zmian.
- **shell (App/navigation)**: cztery zakładki, stan początkowy `now`.
- **scenariusze**: `ScenarioData` rozszerzone o `nowItems`; fixture `full` startuje z
  ułożoną kolejką demo (makieta → KPI → abonamenty).

## Świadome ograniczenia

- Brak powiązania kliknięcia nagłówka grupy w katalogu ze zaznaczeniem wątku w workbench
  (deep-link moduł→moduł) — do rozważenia po testach użytkownika.
- Brak licznika pozycji na zakładce „Teraz".
