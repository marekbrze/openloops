# Journal (Dziennik)

## Vision

Dziennik to osobny widok bilansu zwycięstw — liniowy ślad „ile realnie zrobiłem", dzień po dniu i tydzień po tygodniu. Workbench produkuje fakty (odhaczenia, domknięcia); dziennik jest ich wyłącznie czytelnikiem: żadnych tworzeń, edycji ani kasowania wpisów. Moduł motywacyjny — prostota przekazu ważniejsza niż bogactwo funkcji (MODULES.md, priorytet Medium): jedno spojrzenie na tydzień odpowiada na pytanie „ile zrobiłem".

Zasady kierujące (z dokumentów źródłowych + wywiadu 2026-08-27):

- **Bilans zawsze realny** — zero sugar-coatingu: pusty tydzień pokazuje 0/0, nie udaje sukcesu (konsekwencja decyzji deepen o cofaniu wpisów).
- **Historia jest niezmienialna** — wpisy trzymają snapshot tekstu; żadne miejsce dziennika nie prowadzi do edycji źródła, a usunięcie wątku/akcji niczego w historii nie psuje.
- **Hierarchia liczb ponad dni** — bilans tygodnia (małe vs większe zwycięstwa) jest najsilniejszym elementem ekranu; dni są dowodem, bilans jest tezą.
- **Zero administracji** — jedyna interakcja to nawigacja czasem ← / → / „dziś" i czytanie.

## User Flows

### Wejście do dziennika

1. User klika zakładkę **„Dziennik"** w tobarze (albo wybiera link „Otwórz dziennik" z toastu po domknięciu wątku — zdarzenie `openloops:navigate`).
2. Widok otwiera się na **bieżącym tygodniu** (pon–nd), z dniem dzisiejszym zaznaczonym.

### Nawigacja po tygodniach

1. Strzałka **←** cofa o tydzień w przeszłość, **→** idzie o tydzień do przodu — ale nie może wejść w tydzień przyszły (przy bieżącym tygodniu strzałka → jest nieaktywna).
2. Przycisk **„Dziś"** z każdego miejsca wraca na bieżący tydzień (nieaktywny/no-op, gdy już tam jesteśmy).
3. Wstecz można się cofać swobodnie — poza tygodniem pierwszego użycia aplicacji wszystko wygląda po prostu pusto.

### Czytanie bilansu tygodnia

1. Pod nagłówkiem tygodnia widać skondensowany **bilans**: N małych zwycięstw (skończone akcje) · M większych zwycięstw (domknięte wątki).
2. Dla tygodnia bez wpisów bilans pokazuje 0 · 0 z neutralną notką — fakt, nie osąd.

### Przeglądanie dniami

1. Pod bilansem ciągnie się lista siedmiu dni tygodnia w kolejności **poniedziałek → niedziela**.
2. Dzień ze zwycięstwami: data (+ plakietka „dziś"), własny mini-bilans oraz lista wpisów w kolejności chronologicznej — godzina HH:MM, ikona i etykieta rodzaju (małe/większe), treść snapshotu.
3. Dzień bez wpisów: pojedynczy wygaszony wiersz „brak zwycięstw" — jego obecność utrzymuje rytm tygodnia (wszystkie 7 dni zawsze widoczne, nic się nie zwija).

## Screens (rough)

- **Nagłówek widoku**: tytuł zakresu dat (np. „24–30 sierpnia 2026"), strzałki ← / →, przycisk „Dziś".
- **Blok bilansu tygodnia**: dwie duże liczby z podpisami „małych zwycięstw" / „większych zwycięstw" — najcięższy wizualnie element ekranu.
- **Lista dni**: 7 kart-dni; karta dnia = data + mini-bilans + wpisów-lista (godzina, ikona rodzaju, snapshot). Dzisiejszy dzień wyróżniony subtelnym znacznikiem.
- **Karta błędu odczytu**: alert z wyjaśnieniem i „Spróbuj ponownie" — zastępuje wieczny szkielet przy porażce IndexedDB.
- **Pusty tydzień**: pełny szkielet dni zostaje; świadome „0 · 0 — ten tydzień nie zapisał żadnych zwycięstw".

## Actions

| Action | Description | Entity | Notes |
|--------|------------|--------|-------|
| Open Journal | Zakładka w tobarze lub link z toastu domknięcia | — | zdarzenie `openloops:navigate` |
| Navigate Weeks | ← / → o tydzień; wstecz bez limitu, naprzód nie wchodzi w przyszłość; „dziś" wraca | WeekSummary (widok) | |
| Read Weekly Balance | Suma `action-done` i `loop-closed` na tydzień; zawsze widoczna, także 0·0 | WeekSummary | |
| Browse Day Entries | Kolejność chronologiczna wpisów dnia z godzinami; snapshoty tekstu | DayEntry | tylko odczyt |

## Edge Cases

*Zachowania rozstrzygnięte i zaimplementowane (harden 2026-08-27 — pełna ewidencja: `journal-edgecases.md`).*

- **Tydzień całkiem pusty**: uczciwe 0·0 z notką; wszystkie dni jako wygaszone wiersze (ADR-0017).
- **Tydzień przyszły**: niedostępny — nawigacja → zatrzymuje się na bieżącym tygodniu (ADR-0015).
- **Bieżący tydzień trwa**: dni późniejsze niż dziś wyglądają jak zwykłe puste dni.
- **Usunięte źródło wpisu**: snapshot czyta się samodzielnie, rodzaj wpisu nazywa kontekst.
- **Cofnięcie odhaczenia między dniami**: akcja niezrobiona ⇒ żadnego dnia nie było od niej zwycięstwa — wpisy czyszczone po indeksie `actionId` we wszystkich datach (luka #1, ADR-0019).
- **Porażka odczytu IndexedDB mid-session**: karta z rolą alert i „Spróbuj ponownie”, nigdy wieczny szkielet ani biel aplikacji.
- **Rekord o nieznanym rodzaju** (ręczna edycja bazy, zepsuty seed dev): neutralny „Wpis” zamiast wysypania modułu.
- **Sesja przez północ**: kotwica bieżącego tygodnia dogania datę po odzyskaniu widoczności karty; celowo przeglądany przeszły tydzień zostaje nietknięty.
- **Czytniki ekranu**: zmiany bilansu ogłaszane bezodmienną konstrukcją („Małe zwycięstwa: N”).
- **Wiele wpisów jednym momencie**: stabilne sortowanie po `createdAt`, tie-breaker po id.
- **Long-token snapshot**: łamany `[overflow-wrap:anywhere]` + pełna treść w `title`.

## Integration Points

- **data-layer**: jedyny dostawca danych — odczyt `DayEntry` (`listByDays`) dla zakresu tygodnia; żaden zapis. Agregacje (bilans dnia/tygodnia) liczy warstwa UI.
- **workbench**: bez bezpośredniej komunikacji — spotykają się tylko na danych; workbench pozostaje jedynym pisarzem `DayEntry` (`Toggle Done`, `Close Loop`).
- **nawigacja globalna**: toast po domknięciu wątku prowadzi tu przez `openloops:navigate` (istniejący mechanizm).
