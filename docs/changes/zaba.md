# Feature: Żaba (Eat That Frog) — oznaczanie odkładanych zadań i wątków

## Type
Feature (planned by proto-feature)

## User goal
> „dodaj nowy feature - oznaczenie zadań jako »żaby« inspirowane książką Zjedz tę żabę. chcę żeby to było zarezerwowane do zadań które odkładam. kiedy dodaję je do dziś to one powinny być na samej górze. tak samo można oznaczyć wątki jako żaby i wtedy też są na liście na samej górze. dobierz do tych zadań ikonę żaby i niech będzie zielona."

Żaba to świadomy sygnał „to odkładam, więc to zjem pierwsze": oznaczone zadanie dokładane do kolejki Teraz wskakuje **na samą górę**, oznaczony wątek **wskakuje na górę listy wątków**. Zielony glyph żaby czyni odkładane rzeczy widocznymi na wszystkich powierzchniach.

## Decyzje zakresowe (wywiad 2026-09-08)
1. **Wiele żab naraz** — każde odkładane zadanie/wątek może mieć żabę; brak limitu „jednej na dzień".
2. **Auto-zdjęcie po zjedzeniu** — odhaczenie żaby czyści znacznik (`isFrog: false`); cofnięcie odhaczenia **nie** przywraca żaby (żabę odkłada się świadomie, ponownie). Dla wątków: domknięcie i porzucenie czyści flagę.
3. **Skok na górę, nie przypięcie** — oznaczenie żabą to jednorazowy skok na szczyt ręcznej kolejności; drag & drop pozostaje jedynym źródłem porządku (spójne z ADR-0003 „nowy trafia na górę" i ADR-0023 „plan pracy nie traci głowy"). Zdejmowanie żaby NIE przestawia niczego.

## MVP scope
MUSI działać:
- Przełącznik żaby przy **wierszu akcji** w workbench (aktywna żaba zawsze widoczna, zielona; nieaktywna odkrywa się na hover — konwencja kosza).
- Pozycja **„Żaba" w menu ⋯ nagłówka panelu wątku** (ADR-0010) + zielony glyph na karcie wątku; oznaczenie = skok na górę listy otwartych.
- **Kolejka Teraz**: dodanie żaby wstawia ją na górę (nie na koniec); oznaczenie akcji, która **już leży** w kolejce, przestawia ją na szczyt.
- **Katalog Zadań (modal)**: glify żab przy akcjach i w nagłówkach grup wątków-żab; grupy żab naturalnie pierwsze (dziedziczą `sortOrder` wątków) — bez przełączania tutaj (ADR-0022: katalog nie edytuje).
- **Widoczność glifu**: kolejka Teraz, karta wątku, wiersz akcji, modal.
- Auto-zdjęcie: `toggleDone(done=true)` → `isFrog: false`; `closeLoopWithWin`/`abandon` → `isFrog: false`.
- Własna ikona `FrogIcon` (lucide nie ma żaby) w konwencji lucide, zielona z istniejącej rampy success (hue 150).

Odłożone (Later):
- Pozycja żaby wewnątrz listy akcji wątku (plan wykonania w workbench zostaje nietknięty).
- Licznik żab / sekcja „żaby" w modalu katalogu.
- Tryb „jedna żaba na dzień" (wierność książce kosztem elastyczności).
- Ślad żaby w dzienniku („zjedzona żaba" jako wyróżnik wpisu).

## Impact map
- **New module?**: nie — rozszerzenie 4 istniejących; encje i powierzchnie gotowe.
- **Modules affected**: `data-layer` (pole `isFrog` + logika skoku na górę w repozytoriach), `workbench` (przełączniki + glify), `now` (glif + front-wstawianie w `nowRepo.add`), `tasks` (tylko glify w modalu).
- **Cross-module integration**: **jedyny punkt ryzyka = `nowRepo.add`** — zmienia regułę doklejania na koniec (ADR-0023) dla żab na front. Decyzja czytania `isFrog` zapada **wewnątrz transakcji repo** (lookup akcji), więc żaden call-site (workbench panel, modal) się nie zmienia i nie może zapomnieć. liveQuery odświeża wszystkie powierzchnie automatycznie.
- **Shared-doc additions**: GLOSSARY.md (+żaba/Frog), ENTITY_MAP.md (+`isFrog` na Loop i LoopAction, notka „bez indeksu = bez bumpu schematu"), ACTIONS.md (+Mark/Unmark Frog na Action i Loop, notka front-wstawiania przy Pick For Now), MODULES.md (Overview + opisy modułów + Priority Areas), specy `docs/modules/{workbench,now,tasks}.md`.

## Per-module changes

### data-layer
- **Data**: `Loop.isFrog?: boolean` (`types/index.ts:17-26`), `LoopAction.isFrog?: boolean` (`types/index.ts:29-39`). **Bez indeksu Dexie — bez bumpu wersji schematu** (`db/db.ts` nietknięty): wszystkie odczyty ładują rekordy do pamięci, nikt nie kwerenduje „znajdź wszystkie żaby".
- **Actions**:
  - `loopsRepo.setFrog(id, isFrog)` (nowe, obok `add`/`reopen`): `true` → flaga + `sortOrder = min-1` (wzór ADR-0003, `repositories/index.ts:20-33`); `false` → tylko flaga, pozycja bez zmian.
  - `actionsRepo.setFrog(id, isFrog)` (nowe): `true` + akcja w kolejce → przestaw pozycję kolejki na front (przez `nowRepo.moveToFront`); `false` → tylko flaga.
  - `actionsRepo.toggleDone` (`repositories/index.ts:123-145`): przy `done=true` patch also `isFrog: false` — „zjedzona". Uncheck nie przywraca.
  - `closeLoopWithWin` (`repositories/index.ts:255-272`) i `loopsRepo.abandon` (`repositories/index.ts:62-68`): czyszczą `isFrog` wątku (flaga nie może przeżyć jako nieaktualna; reopen ≠ wciąż odkładana).
  - `nowRepo.add` (`repositories/index.ts:204-219`): w transakcji dokłada lookup `db.actions.get(actionId)`; żaba → `sortOrder = (pierwsze?.sortOrder ?? 0) - 1` (bieżące minimum minus 1 — wzór `loopsRepo.add`); nie-żaba → bez zmian (koniec, ADR-0023).
  - `nowRepo.moveToFront(actionId)` (nowe): `sortOrder = min-1`; no-op gdy pozycji brak.
- **Screens & flows**: brak (warstwa czysto domenowa).
- **States**: brak nowych stanów UI; kaskady ADR-0021 nietknięte (usunięcie akcji/wątku zabiera rekord z flagą razem ze źródłem).
- **Edge cases**: patrz sekcja niżej.
- **Design**: brak.

### workbench
- **Data**: czyta `isFrog` z istniejących rekordów.
- **Actions**: **Mark/Unmark Frog (Action)** — przycisk-ikona w wierszu akcji; **Mark/Unmark Frog (Loop)** — pozycja w menu ⋯ nagłówka panelu (`action-panel.tsx:93`, konwencja ADR-0010). Disabled dla done (żaba żyje tylko na rzeczach do zrobienia — jak PickForNowToggle, `action-row.tsx:94-118`).
- **Screens & flows**:
  - `action-row.tsx:27-88` — przycisk żaby między etykietą a `OwnerTypeToggle`: aktywny = zielony `FrogIcon` (`text-success-ink`, tint `bg-success/15`), nieaktywny = hover-revealed jak kosz (`action-row.tsx:70-78`).
  - `loop-card.tsx:68-70` — zielony glyph `FrogIcon` przy tytule wątku-żaby.
  - Menu ⋯ panelu (`action-panel.tsx`) — pozycja „Oznacz jako żabę"/„Zdejmij żabę"; po oznaczeniu karta wskakuje na górę listy (`loop-list-column.tsx` czyta `useOpenLoops` → `sortBy('sortOrder')`, zero zmian).
- **States**: brak nowych pełnoekranowych; disabled toggle dla done to jedyny nowy stan kontrolki.
- **Edge cases**: oznaczenie wątku-żaby nie przestawia jego akcji w kolejce Teraz (żaba wątku żyje na liście wątków; żaba akcji — w kolejce; rozdzielne semantyki). Zdejmowanie żaby nie przestawia niczego.
- **Design**: glify z rampy success; zero konfetti/animacji (DESIGN.md ban) — dyskretny glyph, elegancja z dyscypliny.

### now (Teraz)
- **Data**: bez zmian (kolejka czyta flagę żywo ze źródła — konwencja wskaźnika ADR-0021).
- **Actions**: bez nowych; `Reorder Queue` nietknięty (drag & drop dalej główny).
- **Screens & flows**: `SortableNowRow` (`now-screen.tsx:147-216`) — zielony glif żaby przy etykiecie akcji-żaby; skreślone done nigdy go nie pokaże (auto-zdjęcie w repo).
- **States**: brak nowych.
- **Edge cases**: żaba oznaczona, gdy akcja już leży w kolejce → skok na szczyt (przez `actionsRepo.setFrog` → `moveToFront`); ręczne przeciągnięcie żaby w dół po fakcie jest dozwolone i trwałe.
- **Design**: glif w rzędzie numeru/kolejki — rozmiar `size-3.5`, spójny z ikonami wiersza.

### tasks (modal „Wybierz zadania")
- **Data**: bez zmian.
- **Actions**: bez nowych — katalog tylko czyta (ADR-0022); glify informacyjne.
- **Screens & flows**: `TaskGroupHeading` (`task-picker-modal.tsx:108+`) — glif przy tytule grupy wątku-żaby; wiersz zadania — glif przy akcji-żabie. Grupy żab są pierwsze automatycznie (kolejność grup = `sortOrder` wątków, `use-tasks.ts:26`).
- **States**: brak nowych.
- **Edge cases**: brak (powierzchnia pasywna).
- **Design**: jak workbench/now.

### shared (FrogIcon)
- **Data**: —
- **Screens & flows**: `src/shared/components/frog-icon.tsx` (nowy) — SVG 24×24, `stroke="currentColor"`, `strokeWidth={2}`, `strokeLinecap/Linejoin="round"`, `fill="none"`, props `className` (użycia: `size-3.5`/`size-4`), `aria-hidden` (znaczenie niesie etykieta/aria-label przycisku).
- **Design**: projekt glifu — siedząca żaba z okiem, czytelna w 14px; konwencja lucide.

## States & Edge cases (dla proto-edgecases/harden)
- Żaba oznaczona, gdy akcja **już w kolejce** → skok na front (świadoma decyzja: „zjem ją pierwsza").
- Żaba dodana do **pustej** kolejki → normalny przypadek front-wstawienia (min-1).
- **Ręczne przeciągnięcie żaby w dół** → porządek usera wygrywa; nic nie wskakuje z powrotem.
- **Done żaby**: toggle disabled w UI; odhaczenie inną drogą (checkbox) i tak czyści flagę w repo; uncheck nie przywraca.
- **Done żaby wątku**: domknięcie/porzucenie czyści flagę; reopen **nie** przywraca żaby.
- **Zdejmowanie żaby** z akcji w kolejce → zostaje na swoim miejscu kolejki.
- **Wszystkie żaby zdjęte** → UI wraca do zachowania sprzed feature (zero śladów).
- liveQuery: oznaczenie żaby w modalu/workbench natychmiast przestawia kolejkę na innym ekranie (jeden zapis, wszystkie powierzchnie).
- Scenariusze demo (`src/scenarios/`) + stories: dokładnie jedna żaba-akcja i jeden wątek-żaba, żeby testowany był i skok na górę, i glif.

## Routing — which proto skill builds what
| Step | Skill | Target | What it does |
|------|-------|--------|--------------|
| 1 | proto-feature | — | ten plan |
| 2 | (spec update, styl proto-detail) | all | dokumenty współdzielone (GLOSSARY/ENTITY_MAP/ACTIONS/MODULES) + specy `docs/modules/{workbench,now,tasks}.md` — wpisy żaby |
| 3 | (direct edit — residual) | data-layer, workbench, now, tasks, shared | implementacja: pola, repo, FrogIcon, przełączniki, glify, stories, scenariusze |
| 4 | proto-edgecases → proto-harden | workbench, now, tasks | audyt + stany po fakcie (żaby dodają przypadki brzegowe do istniejących audytów) |
| 5 | proto-design → proto-polish | workbench, now | tylko jeśli glif/tinta wymagają szlifu poza residual (zielony w praktyce = gotowe tokeny success) |

Brak nowych ekranów i encji-tabel — nie routuje się do `proto-lofi`; warstwa wizualna istnieje (DESIGN.md), więc żaba dostaje tylko tokeny success i glif.

## Residual — direct edits not covered by a proto skill
- **`src/modules/data-layer/types/index.ts:17-26`** — `Loop`: dodać `/** Żaba: odkładana świadomie; oznaczenie = skok na górę listy (ADR-0037). */ isFrog?: boolean`.
- **`src/modules/data-layer/types/index.ts:29-39`** — `LoopAction`: dodać `isFrog?: boolean` (ta sama konwencja komentarza).
- **`src/modules/data-layer/repositories/index.ts:18+`** — `loopsRepo.setFrog(id, isFrog)`: `true` → `sortOrder = (min?.sortOrder ?? 1) - 1` + flaga (wzór `add`, linia 20-33); `false` → tylko flaga.
- **`src/modules/data-layer/repositories/index.ts:62-68`** — `abandon`: w transakcji także `isFrog: false` (flaga nie przeżywa porzucenia; reopen nie przywraca żaby).
- **`src/modules/data-layer/repositories/index.ts:123-145`** — `toggleDone`: gałąź `done=true` patch `{ done: true, doneAt: now(), isFrog: false }`.
- **`src/modules/data-layer/repositories/index.ts:204-219`** — `nowRepo.add`: w transakcji `const action = await db.actions.get(actionId)`; gdy `action?.isFrog` → `item.sortOrder = (first?.sortOrder ?? 0) - 1` zamiast doklejenia na koniec.
- **`src/modules/data-layer/repositories/index.ts:220+`** — `nowRepo.moveToFront(actionId)`: read-modify-write w transakcji; no-op gdy brak pozycji.
- **`src/modules/data-layer/repositories/index.ts:255-272`** — `closeLoopWithWin`: patch `isFrog: false` razem ze zmianą statusu.
- **`src/modules/data-layer/repositories/index.ts:99+`** — `actionsRepo.setFrog(id, isFrog)`: update flagi; gdy `true` → `nowRepo.moveToFront(id)`.
- **`src/shared/components/frog-icon.tsx`** (nowy) — SVG żaba w konwencji lucide; eksport z `@/shared/components`.
- **`src/modules/workbench/components/action-row.tsx:27-88`** — przycisk żaby (aria-label „Oznacz jako żabę: {label}"/„Zdejmij żabę: {label}", `title="Żaba — zjedz ją pierwsza"`, disabled gdy done); aktywny: `bg-success/15 text-success-ink`, nieaktywny: hover-revealed jak kosz.
- **`src/modules/workbench/components/action-panel.tsx:93`** — menu ⋯: pozycja „Oznacz jako żabę"/„Zdejmij żabę" → `loopsRepo.setFrog`; glif żaby w nagłówku panelu gdy wątek jest żabą.
- **`src/modules/workbench/components/loop-card.tsx:68-70`** — glif `FrogIcon` (`text-success-ink`) przy tytule.
- **`src/modules/now/components/now-screen.tsx:147-216`** — glif żaby przy etykiecie akcji w kolejce.
- **`src/modules/tasks/components/task-picker-modal.tsx:108+`** — glify przy nagłówku grupy i wierszach akcji-żab.
- **stories**: `action-row.stories.tsx` (+żaba aktywna/done-disabled), `loop-card.stories.tsx` (+wątek-żaba), `task-picker-modal.stories.tsx`, `now-screen.stories.tsx` (+żaba w kolejce) — fabryki `mkAction`/`mkLoop` z `isFrog`.
- **`src/scenarios/`** — scenariusz demo: jedna akcja-żaba i jeden wątek-żaba.

## Later (deferred)
- Pozycja żaby wewnątrz listy akcji wątku (plan wykonania workbench).
- Licznik/sekcja żab w modalu katalogu.
- Tryb „jedna żaba na dzień".
- Wyróżnik „zjedzona żaba" we wpisach dziennika.

## Hand-off
Kolejność: ten plan → dokumenty współdzielone + specy (krok 2) → residual direct edits (krok 3) → proto-edgecases/harden (krok 4). Ten dokument jest bazą każdego z tych kroków.
