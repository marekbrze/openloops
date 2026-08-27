# Feature: Katalog Zadań jako modal na Teraz

## Type
Feature (planned by proto-feature)

## User goal
> „chcę żeby [lista zadań] była elementem ekranu Teraz i żeby pokazywała się w modalu po kliknięciu przycisku »wybierz zadania«. Nie ma sensu trzymać tego ekranu oddzielnie."

Dobieranie zadań do kolejki dnia dzieje się **bez opuszczania głównego ekranu pracy**: Teraz otwiera katalog w modalu, wybór przełącznikiem „Teraz" dopisuje do kolejki na żywo (liveQuery), modal się zamyka — plan dnia jest gotowy. Zakładka „Zadania" w tobarze wycofana.

## MVP scope
MUSI działać:
- Przycisk **„Wybierz zadania"** na ekranie Teraz (widoczny zawsze, nie tylko w stanie pustym) otwierający modal z katalogiem.
- Modal z pełną treścią dzisiejszego katalogu: grupy po wątku, licznik „N do zrobienia", przełącznik „Teraz" per wiersz.
- Wszystkie istniejące stany katalogu przeniesione do modalu: szkielet, karta błędu z retry, dwa stany puste (świeży świat / wątki bez kroków).
- CTA stanów pustych modalu prowadzi do workbench (modal się zamyka przed nawigacją).
- Zakładka „Zadania" zniknęła z tobaru; `ViewId` bez `'tasks'`; wejście do aplikacji i tak było na Teraz.

Odłożone (Later):
- Pamięć stanu modalu (otwarty po odświeżeniu) — niepotrzebne przy krótkiej interakcji.
- Wyszukiwarka/filtr w katalogu — dopiero gdy katalog urośnie.

## Impact map
- **New module?**: nie — tasks przestaje być powierzchnią zakładki, zostaje komponentem modalnym osadzonym w Teraz.
- **Modules affected**: `tasks` (ekran → `TaskPickerModal`), `now` (przycisk-wyzwalacz + CTA stanu pustego), shell (`App.tsx` tobar, `lib/navigation.ts`), dokumentacja współdzielona.
- **Cross-module integration**: bez zmian — `nowRepo` jedynym pisarzem kolejki, `usePickedActionIds` wspólnym źródłem stanu wyboru, liveQuery odświeża modal i kolejkę jednocześnie. Ryzyko zerowe, bo semantyka przełącznika (ADR-0022) i doklejania na koniec (ADR-0023) nietknięte.
- **Shared-doc additions**: ACTIONS.md (sekcja TaskCatalog → modal, „Open Tasks" → „Open Task Picker"), PROJECT.md (linia przepływu), GLOSSARY.md + ENTITY_MAP.md (drobne: „na liście Zadania" → „w modalu Zadania"), MODULES.md (opis modułu tasks + Overview + Priority Areas), specs `docs/modules/tasks.md` i `now.md`.

## Per-module changes

### tasks (Zadania → modal „Wybierz zadania")
- **Data**: bez zmian (odczyt Loop × Action przez `useTaskCatalog`, zapis wyłącznie `nowRepo`).
- **Actions**: Browse Catalog, Pick For Now / Unpick — bez zmian; Open Workbench ze stanów pustych zamyka modal przed `openView('workbench')`.
- **Screens & flows**: `TaskListScreen` (zakładka) → `TaskPickerModal` (`src/modules/tasks/components/task-picker-modal.tsx`): nagłówek „Wybierz zadania" + licznik + X; treść = dzisiejsze grupy; scroll wewnątrz panelu; szerokość ~`max-w-2xl`. Otwierany z Teraz, zamykany X / Esc / klik w tło (natywny `<dialog>`).
- **States**: reużyte 1:1 — szkielet, karta błędu, świeży świat, wątki bez kroków, pełny katalog; skreślone done z wyłączonym przełącznikiem.
- **Edge cases**: Esc/klik tła w trakcie wyboru nie gubi niczego (wybór już zapisany w repo); CTA pustych stanów zamyka modal przed nawigacją; długi katalog = scroll panelu (max-h), nie rozciąganie strony; focus wraca do przycisku otwierającego (natywnie).
- **Design**: lo-fi bez zmian rejestrów; modal w konwencji `Dialog` (jak `CloseLoopModal`).

### now (Teraz)
- **Data**: bez zmian.
- **Actions**: nowe **Open Task Picker** (otwarcie modalu); EmptyQueue-CTA przestaje robić `openView('tasks')`.
- **Screens & flows**: przycisk „Wybierz zadania" (outline, ikona `ListPlus`) w nagłówku ekranu — zawsze dostępny; stan pusty „nic nie wybrane" otwiera ten sam modal zamiast przeskoku zakładki.
- **States**: bez nowych (modal pokrywa własne).
- **Edge cases**: modal otwarty nad ekranem z błędem odczytu kolejki — dopuszczalne, wybór i tak dokleja do kolejki odświeżanej po retry.
- **Design**: bez zmian.

### shell / nawigacja
- **Data**: —
- **Actions**: usunięcie miejsca docelowego `tasks` („Open Tasks" znika).
- **Screens & flows**: `App.tsx` — tab „Zadania" wypada z `MODULE_TABS`, gałąź `view === 'tasks'` znika; `lib/navigation.ts` — `ViewId` bez `'tasks'`.
- **States**: —
- **Edge cases**: brak innych `openView('tasks')` w kodzie (jedyna referencja to EmptyQueue).
- **Design**: —

## Routing — which proto skill builds what
| Step | Skill | Target | What it does |
|------|-------|--------|--------------|
| 1 | proto-feature | — | ten plan |
| 2 | (spec update, styl proto-detail) | tasks, now | przepisanie `docs/modules/tasks.md` na modal + flow w `now.md` + dokumenty współdzielone |
| 3 | (direct edit — residual) | tasks, now, shell | implementacja modalu, przycisku, usunięcie zakładki; stories podążają |
| 4 | proto-edgecases → harden | now, tasks | późniejszy pełny audyt (moduły wdrożone 2026-08-27 wciąż go nie mają) |

Brak nowych ekranów i encji — nie routuje się do `proto-lofi`; warstwa wizualna (DESIGN.md) jeszcze nie istnieje, więc `design`/`polish` później.

## Residual — direct edits not covered by a proto skill
- **`src/modules/tasks/components/task-picker-modal.tsx`** (nowy) — treść z `task-list-screen.tsx` opakowana w `Dialog`; `TaskListScreen` + `task-list-screen.tsx` usuwane.
- **`src/modules/tasks/index.ts`** — eksport `TaskPickerModal` zamiast pustki.
- **`src/modules/now/components/now-screen.tsx`** — stan modalu + przycisk w nagłówku; `EmptyQueue` przyjmuje `onPickTasks` zamiast `openView('tasks')`.
- **`src/App.tsx:14,94`** — tab i gałąź `tasks` usuwane.
- **`src/lib/navigation.ts:5`** — `ViewId` bez `'tasks'`.
- **stories** — `task-list-screen.stories.tsx` → `task-picker-modal.stories.tsx` (modal otwarty, te same scenariusze); `now-screen.stories.tsx` bez zmian treści.

## Later (deferred)
- Pełny audyt `proto-edgecases` + `proto-harden` dla now i tasks (nadal otwarty z raportu statusu).
- Warstwa wizualna (`proto-brand` → `design` → `polish`) po stabilizacji interakcji.

## Hand-off
Kolejność: plan (ten dokument) → specy + dokumenty → implementacja residual → stories. Ten dokument jest bazą dla każdego z tych kroków.
