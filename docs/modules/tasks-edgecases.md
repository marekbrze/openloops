# Tasks (Zadania) — Edge Cases

*Audyt stres-testowy z 2026-08-27 (proto-edgecases), przed fazą proto-harden.*
*Zakres: cały moduł — modal „Wybierz zadania" (nagłówek z licznikiem, grupy, wiersze, stany puste) + przełącznik Teraz wspólny z workbench.*

## Coverage

- **Spec captured na starcie**: 8 pozycji z `docs/modules/tasks.md` — **wszystkie 8 obsłużonych w kodzie** (Esc/tło z zapisanymi wyborami, pusty katalog z CTA, wątki bez kroków jako osobny wariant, membership-disabled, kaskada usunięć przez liveQuery, done skreślone + disabled, karta błędu odczytu, scroll wewnętrzny + truncation).
- **Nowe luki z audytu**: 6 → 🔴 0 · 🟡 1 · 🟢 5 (plus 1 odroczona dziedziczona).
- **Największe źródło luk**: warstwa prezentacji liczników/etykiet (stany przejściowe kłamią milcząco) i jedna luka systemowa — toasty błędów nieustawialne nad natywnym `<dialog>`.

## Inventory

| # | Severity | Category | Edge case | Behavior today | Suggested behavior | Where |
|---|----------|----------|-----------|----------------|--------------------|-------|
| 1 | 🟡 | Errors / cross-module | Toast porażki mutacji niewidoczny nad modalem: pick/unpick idzie przez `guard` → `notify.error` → `AppNotices` w rootcie App, ale `showModal()` wstawia dialog w **top layer** przeglądarki — baner renderuje się pod spodem i użytkownik nie widzi go do zamknięcia modala | Cisza po nieudanym toggle | Toast w top layer (np. `<dialog>` dla notices albo popover API) albo inline-komunikat w panelu modalu; docelowo systemowe, leczy też przyszłe modale (close-loop itd.) | `src/modules/tasks/components/task-picker-modal.tsx:130` + `src/shared/components/dialog.tsx:31` + `src/App.tsx:102` |
| 2 | 🟢 | Data states / race | Licznik „N do zrobienia" w nagłówku pokazuje **„0 do zrobienia"** dopóki katalog się ładuje (`groups ?? []`) — stan przejściowy kłamie | „0 do zrobienia" przy szkielecie | Ukryj licznik (albo placeholder „…") dopóki `groups === undefined` | `src/modules/tasks/components/task-picker-modal.tsx:32,48` |
| 3 | 🟢 | Data states | Tytuł wątku w nagłówku grupy bez `truncate`/`min-w-0` — bardzo długi tytuł zawija nagłówek grupy i spycha bilans `done/total` (niespójnie z wierszami) | Zawijanie bez kontroli | `min-w-0 truncate` na `<h3>` + `title=` z pełnym tytułem | `src/modules/tasks/components/task-picker-modal.tsx:110` |
| 4 | 🟢 | Data states | Etykieta zadania ucięta bez `title=` — pełna treść nieosiągalna (konwencja z hardenu dziennika #8; ta sama luka po stronie Teraz) | Ucięcie bez dostępu do całości | `title={action.label}` na uciętym `<span>` | `src/modules/tasks/components/task-picker-modal.tsx:154` |
| 5 | 🟢 | Errors | Retry katalogu (`retryToken`) nie odgrzewa kwerendy członkostwa (`usePickedActionIds` z deps `[]`) — jeśli to właśnie membership odczyt się nie powiódł, „Spróbuj ponownie" niczego nie zmienia | Przełączniki wiecznie disabled mimo retry | Wspólny retry-token przekazany do hooka członkostwa (zmiana współdzielona z modułem now) | `src/modules/tasks/components/task-picker-modal.tsx:29-30` + `src/modules/now/hooks/use-now.ts:85-90` |
| 6 | 🟢 | Prototype-specific | LiveQuery katalogu i członkostwa subskrybowane także przy zamkniętym dialogu — każda mutacja w aplikacji przelicza niewidoczny katalog | Zbędne kwerendy w tle | Gate'ować subskrypcje flagą `open` (optymalizacja; spójna z luką #6 w now-edgecases) | `src/modules/tasks/components/task-picker-modal.tsx:29-30` |
| 7 | ⏸️ | Action outcomes | Podwójne kliknięcie przełącznika w locie (add+remove bez zakończenia zapisu) — deterministyczny klucz czyni to bezpiecznym danych, ale kontrolka nie czeka | Kontrolka aktywna w locie | Odroczone jak w workbench (#13) / now (#7); ewentualny optimistic-disable | `src/modules/tasks/components/task-picker-modal.tsx:129-130` |

**Kategorie sprawdzone bez uwag**: Empty states ✔ (trzy warianty: szkielet / brak wątków / wątki bez kroków, `task-picker-modal.tsx:64-81`), Errors–read ✔ (sentinel + karta retry `use-tasks.ts:53-77`, `task-picker-modal.tsx:198-215`), Forms & input ✔ (moduł bez formularzy — celowo, ADR-0022), Validation ✔ (n/d), Destructive ✔ (moduł nie niszczy niczego — zdjęcie z kolejki odwracalne), Success feedback ✔ (natychmiastowy efekt wizualny przełącznika + kolejka pod spodem przez liveQuery — spec ADR-0024), State transitions ✔ (done → disabled, `task-picker-modal.tsx:142`; usunięta akcja/wątek znika z otwartego modalu przez liveQuery), Loading initial ✔ (szkielet; grupy zostają między liveQuery `use-tasks.ts:67-76`), Navigation ✔ (Esc/tło/X wracają na Teraz z zapisanymi wyborami — natywny `<dialog>` `dialog.tsx:40-44`; focus wraca do otwierającego), Deep-link ✔ (dziedziczone ⏸️ #10 workbench), Cross-module ✔ (kaskady ADR-0021 czytają się przez liveQuery), Storage ✔ (guard na zapis, sentinel na odczyt, bootstrap w `App.tsx`), Offline ✔, Unicode/RTL/emoji ✔, Boundary ✔ (`followUpDate === dziś` nie jest po terminie `task-picker-modal.tsx:126`), Licznik grup `done/total` ✔ (`task-picker-modal.tsx:105-115`).

## Priority list

1. **Toast błędu nad modalem (#1)** — jedyna droga, w której porażka zapisu jest dla użytkownika całkowicie niema; naprawa systemowa (top-layer notices) zwróci się w każdym przyszłym modalu.
2. **Licznik „0 do zrobienia" przy szkielecie (#2)** — drobiazg na first-paint modalu, jedna linijka.
3. **Tytuł grupy + `title=` (#3, #4)** — spójność truncation z resztą systemu.
4. **Retry odgrzewa membership (#5)** — razem z luką #3 w now-edgecases (współdzielony hook).
5. #6 gate liveQuery — opcjonalna optymalizacja.
6. #7 odroczona świadomie.

## Hand-off to proto-harden

- #1 — decyzja architektoniczna po stronie shared (notices w top layer) albo inline-error w modalu; wskazane rozstrzygnięcie z projektantem.
- #2–#4 — kosmetyka w jednym pliku `task-picker-modal.tsx`.
- #5 — wspólny retry-token w `usePickedActionIds` (jeden hook, dwa moduły).
