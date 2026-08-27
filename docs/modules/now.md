# Now (Teraz)

## Vision

Teraz to główny ekran pracy aplikacji i jej widok startowy (ADR-0020): wchodzisz po to, by zobaczyć **co jest do zrobienia dziś** — a nie by zarządzać wątkami. Ekran opowiada dzień: data z dniem tygodnia i żywym zegarem na górze, pod nimi ręcznie układana **kolejka** akcji wybranych z listy Zadania albo prosto z panelu workbench.

Zasady kierujące:

- **Kolejka żyje na źródle** — pozycja trzyma tylko wskaźnik (`NowItem.actionId`); treść, typ i status zawsze czytane z `LoopAction`/`Loop` (ADR-0021). Zero duplikatów danych, zero ghost-pozycji.
- **Doklejanie na koniec** — góra listy znaczy „następne w kolejce”; nowe zadanie nie może przewrócić ułożonego planu (ADR-0023).
- **Zrobione zostają** — odhaczenie zostawia skreśloną pozycję na miejscu; zdjęcie (pojedyncze albo masowe) to świadoma decyzja użytkownika.
- **Jedna semantyka zwycięstw** — checkbox na Teraz działa identycznie jak w workbench: pisze `DayEntry` przez `toggleDone`; ekran nie ma własnej księgowości.

## User Flows

### Wejście do aplikacji

1. Aplikacja otwiera się na zakładce **„Teraz”** (pierwsza w tobarze).
2. Nagłówek pokazuje dzisiejszą datę z dniem tygodnia („Czwartek, 27 sierpnia”) i aktualną godzinę HH:MM — zegar dokładany do pełnej minuty, dogania się po wznowieniu karty albo wybudzeniu systemu.

### Układanie dnia

1. Kolejka pokazuje wszystkie wybrane akcje ponumerowane (1., 2., …) w ręcznym porządku; każdy wiersz ma kontekst: tytuł wątku-source, znacznik „czeka” dla WaitingOn i „po terminie” gdy minęła data dopytania.
2. Drag & drop (uchwyt lub klawiatura) przestawia pozycje; zapis idzie do `nowRepo.reorder` — numeracja to także plan wykonania.
3. Checkbox odhacza akcję → małe zwycięstwo w dzienniku; pozycja skreślona zostaje w kolejce aż do zdjęcia.

### Zdejmowanie

1. X przy wierszu zdejmie pojedynczą pozycję (`removeByActionId`).
2. Gdy ≥1 pozycja jest done, pod listą pojawia się CTA **„Zdejmij zrobione (n)”** — masowo jednym ruchem.

### Dobieranie zadań

1. Ze stanu pustego przycisk prowadzi odpowiednio: świat bez wątków → Workbench; są wątki, brak wyboru → lista Zadania.
2. Akcja dołączona gdziekolwiek (Zadania / workbench) wskakuje na koniec kolejki natychmiast — liveQuery.

## Screens (rough)

- **Hero dnia**: duży tytuł daty + meta liczności („3 do zrobienia · 1 zrobione”) + zegar HH:MM tabular-nums po prawej.
- **Kolejka**: numerowana lista kart; wiersz = numer · checkbox · etykieta (+kontekst wątku/czekania) · X · uchwyt DnD.
- **CTA masowego zdejmowania** (warunkowy).
- **Stany specjalne**: szkielet ładowania (rytm karty), karta porażki odczytu z „Spróbuj ponownie”, dwa warianty stanu pustego (świeży świat / nic nie wybrane).

## Actions

| Action | Description | Entity | Notes |
|--------|------------|--------|-------|
| Read Day | Data + dzień tygodnia + żywy zegar | widok | czas lokalny, format pl-PL |
| Reorder Queue | Drag & drop pozycji kolejki | NowItem.sortOrder | PL komunikaty screen-readera (konwencja `pl-dnd`) |
| Toggle Done in Queue | Odhaczenie akcji prosto z Teraz | Action.done | pisze dziennik jak workbench |
| Remove From Queue | Pojedynczo (X) albo masowo („Zdejmij zrobione”) | NowItem | źródło (akcja/wątek) nietknięte |

## Edge Cases

*Rozstrzygnięte projektowo 2026-08-27:*

- **Usunięta akcja / usunięty wątek** → kaskada czyści jego pozycje kolejki (ADR-0021); dodatkowo filtr obronny w kwerendzie nie dopuszcza osieroconych rekordów.
- **Domknięcie / porzucenie wątku** → jego akcje znikają z kolejki (nie są już wykonalne); **reopen ich nie odtwarza** (analogia do ADR-0003).
- **Wszystkie pozycje done** → lista normalna, skreślenia + CTA „Zdejmij zrobione”; 0 do zrobienia w meta.
- **Świeży świat vs. brak wyboru** → dwa różne stany pustego z własnymi CTA (Workbench / Zadania).
- **Sesja przez północ / uśpiona karta** → zegar i data doganiają przy odzyskaniu widoczności/fokusu.
- **Porażka odczytu IndexedDB** → karta alert z retry, nigdy wieczny szkielet (konwencja dziennika).
- **Double-toggle tej samej akcji** → deterministyczny klucz `now:${actionId}` czyni operację idempotentną.
- **Membership w trakcie ładowania** (przełączniki po stronie Zadania/workbench) → kontrolki czekają (disabled), zamiast kłamać stanem.

## Integration Points

- **data-layer**: `nowRepo` (jedyne API mutacji), liveQuery join `nowItems × actions × loops`; kaskady w `actionsRepo.remove`, `loopsRepo.remove/abandon`, `closeLoopWithWin`.
- **tasks / workbench**: oba moduły używają hooka `usePickedActionIds` (jeden zbior czytania naraz) i piszą przez `nowRepo` — przełącznik zachowuje się identycznie w każdym z miejsc.
- **journal**: bezpośredni kontakt żaden — odhaczenie na Teraz trafia do dziennika tą samą ścieżką co z workbench.
