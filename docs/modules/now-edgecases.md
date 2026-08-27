# Now (Teraz) — Edge Cases

*Audyt stres-testowy z 2026-08-27 (proto-edgecases), przed fazą proto-harden.*
*Zakres: cały moduł — hero dnia, kolejka, DnD, stany puste, modal „Wybierz zadania" jako integracja (treść modalu audytowana osobno w `tasks-edgecases.md`).*

## Coverage

- **Spec captured na starcie**: 8 pozycji z `docs/modules/now.md` — **wszystkie 8 obsłużonych w kodzie** (kaskady ADR-0021 + filtr obronny, reopen bez odtwarzania, honest-zero meta, dwa stany puste, resync zegara, karta błędu odczytu, idempotentny klucz `now:${actionId}`, membership-disabled).
- **Nowe luki z audytu**: 7 → 🔴 0 · 🟡 2 · 🟢 5 (plus 2 odroczone dziedziczone z workbench).
- **Największe źródło luk**: wyścigi stanów pochodnych (licznik otwartych wątków, członkostwo kolejki) — odczyt główny ma pełną obsługę błędu, aux-reads już nie; brak potwierdzenia indeksów przed zapisem reorderu.

## Inventory

| # | Severity | Category | Edge case | Behavior today | Suggested behavior | Where |
|---|----------|----------|-----------|----------------|--------------------|-------|
| 1 | 🟡 | Data states / race | Wyścig stanu pustego: `rows` już czytelne, `openLoopCount` jeszcze `undefined` → `?? 0` daje wariant „świeży świat" z CTA do workbench, po chwili mruga do właściwego „nic nie wybrane" | Fałszywy wariant stanu pustego na ekranie lądowania | Renderuj EmptyQueue dopiero gdy `openLoopCount !== undefined` (do tego czasu szkielet) — decyzja o wariancie na twardej danych | `src/modules/now/components/now-screen.tsx:71` |
| 2 | 🟡 | Action outcomes | Drag-end po zmianie wierszy w trakcie przeciągania: `findIndex` zwraca −1, `arrayMove(…, −1, …)` przestawia zły element i **zapisuje fałszywy porządek dnia** do `nowRepo.reorder` | Brak guardy na −1 | Early-return gdy `oldIndex === -1 \|\| newIndex === -1` (zapis tylko z poprawnych indeksów) | `src/modules/now/components/now-screen.tsx:93-95` |
| 3 | 🟢 | Errors | Odczyty pomocnicze bez obsługi porażki: `usePickedActionIds` i `useOpenLoopCount` nie mają sentinelu `READ_ERROR` — przy odmowie odczytu pierwszy wiecznie zwraca `undefined` (przełączniki modalu wiecznie disabled bez wyjaśnienia), drugi kłamie „świeży świat" | Cisza / wieczny disabled | Wrap w try/catch konwencją dziennika; retry głównej kwerendy powinien odgrzewać też te odczyty | `src/modules/now/hooks/use-now.ts:85-96` |
| 4 | 🟢 | Data states | Truncation bez pełnej treści: `action.label` i `loop.title` ucięte bez `title=` — długi tekst nie do odczytania (konwencja z hardenu dziennika #8) | Ucięcie bez dostępu do całości | `title={label}` / `title={loop.title}` na uciętych `<p>` | `src/modules/now/components/now-screen.tsx:163,165` |
| 5 | 🟢 | Boundary values | Numeracja pozycji ≥ 100: kolumna `w-5` (20 px) nie mieści „100." — cyfry nachodzą na checkbox | Stała szerokość kolumny numeru | `min-w-5` zamiast `w-5` (albo bez górnej granicy — kolejka dnia rzadko >99; tanie zabezpieczenie) | `src/modules/now/components/now-screen.tsx:150` |
| 6 | 🟢 | Prototype-specific | LiveQuery modalu i członkostwa żyją też przy zamkniętym dialogu — każda mutacja w kolejce przelicza katalog niewidoczny dla użytkownika | Zbędne kwerendy w tle | Gate'ować subskrypcje flagą `open` (optymalizacja; nie blokuje harden) | `src/modules/now/components/now-screen.tsx:78` |
| 7 | ⏸️ | Action outcomes | Brak in-flight disable przy toggle/X/reorder (mikro-wyścig podwójnego kliknięcia) | Kontrolki aktywne podczas zapisu | Świadomie odroczone w workbench (#13) — ta sama decyzja; optimistic-disable gdy testy pokażą problem | `src/modules/now/components/now-screen.tsx:157,180` |
| 8 | ⏸️ | State transitions | Nowy dzień, wczorajsza kolejka: brak rolowania dnia — zrobione i niezdejmowane pozycje witają użytkownika rano | Kolejka trwa ponad datę | Świadome wg ADR-0023 („zrobione zostają", zdjęcie = decyzja użytkownika); wrócić do tematu po testach userów, nie w harden | `src/modules/data-layer/repositories/index.ts:196-236` |

**Kategorie sprawdzone bez uwag**: Empty states ✔ (dwa warianty + CTA, `now-screen.tsx:228-246`), Loading initial ✔ (szkielet w rytmie karty `now-screen.tsx:69`, leniwy stan między liveQuery `use-now.ts:72-79`), Errors–read ✔ (sentinel + karta retry `use-now.ts:46-58`, `now-screen.tsx:252-269`), Errors–write ✔ (guard → baner, wszystkie mutacje), Forms & input ✔ (moduł bez formularzy), Validation ✔ (n/d), Destructive confirm ✔ (zdjęcie nie niszczy danych — źródło nietknięte, powrót przez modal/workbench), Undo ✔ (n/d przy odwracalności), Success feedback ✔ (masowe zdjęcie ma toast `now-screen.tsx:99-103`; pojedyncze ma wizualny natychmiastowy efekt — spójnie z kulturą aplikacji), State transitions ✔ (kaskady: `repositories/index.ts:80-88,159-165,255-272`; reopen bez odtwarzania), Cross-module deleted-source ✔ (join-filtr `use-now.ts:37-42`), Storage write/quota ✔ (guard), Storage read ✔ (sentinel + bootstrap w `App.tsx:29-42`), Offline ✔ (runtime bez sieci, dziedziczone #15 workbench), Navigation/back/deep-link ✔ (dziedziczone ⏸️ #10 workbench), Unicode/RTL/emoji ✔ (tekst bez transformacji), Północ/uśpienie ✔ (`use-now-clock.ts:27-39`).

## Priority list

1. **Wyścig stanu pustego (#1)** — fałszywy komunikat na ekranie lądowania; taniaGuarda przed renderem EmptyQueue.
2. **Guarda −1 w drag-endzie (#2)** — jedyna droga do zapisania fałszywego porządku dnia.
3. **Obsługa błędu odczytów pomocniczych + re-arm retry (#3)** — spójność z konwencją dziennika; dotyka też modalu tasks.
4. 🟢 wg tabeli: `title=` (4) · min-w numeracji (5) · gate liveQuery modalu (6).
5. Odroczone świadomie: #7, #8 — decyzje zapisane, wracamy po testach userów.

## Hand-off to proto-harden

- #1 — render EmptyQueue po rozstrzygnięciu obu kwerend (szkielet do tego czasu).
- #2 — early-return na −1 w `handleDragEnd`.
- #3 — try/catch + wspólny retry-token dla `usePickedActionIds`/`useOpenLoopCount` (uwaga: hook dzielony z tasks — zmiana w jednym miejscu).
- #4–#6 — tanie, wszystkie w jednym pliku ekranu.
