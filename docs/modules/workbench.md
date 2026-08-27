# Workbench

## Vision

Workbench to ekran główny aplikacji — mapa dnia użytkownika. Lewa kolumna to ręcznie priorytetyzowana lista **otwartych** wątków: karty z tagami, progresem liczącym wyłącznie akcje „mój ruch" i wskaźnikiem „czeka na innych". Zaznaczenie wątku otwiera prawą kolumnę: jego akcje z typami, ręczną kolejnością i opcjonalną datą dopytania, z **przypiętym celem zawsze jako ostatnim elementem listy**. Tu zapada decyzja o domknięciu — chwila nagrody, nie administracji.

Zasady kierujące (z wywiadu 2026-08-27):

- **Szybkość przechwytywania ponad formalność** — nowy wątek to pole inline nad listą, nie modal; świeży temat ląduje **na górze**, od razu zaznaczony do rozpisania.
- **Układ dwukolumnowy jest stały** — pusty prawy panel pokazuje zachętę „Wybierz wątek…", nigdy skoku layoutu.
- **Edycja wszędzie klik-to-edit** — drobne poprawki tekstów nie przechodzą przez dialogi; dedykowane przełączniki tylko dla danych strukturalnych (typ akcji, data dopytania).
- **Moment domknięcia jest celebracją** — modal „Cel osiągnięty" nazywa zwycięstwo i mówi, że wpis trafia do dziennika.
- **Zero fałszywego progresu** — brak akcji „mój ruch" = brak bara, tylko etykieta stanu.

## User Flows

### Przechwycenie nowego wątku

1. User wpisuje tytuł w inline polu nad listą (widocznym zawsze jako pierwszy element lewej kolumny) → opcjonalnie rozwija drugie pole na cel.
2. Enter → nowy wątek pojawia się **na górze listy**, zostaje automatycznie zaznaczony.
3. User od razu dopisuje akcje w prawym panelu; cel może zostać dopisany później (edytowalny zawsze).

### Planowanie akcji zaznaczonego wątku

1. Zaznaczenie karty wątku → prawy panel pokazuje jego akcje (albo zachętę „rozpisz kroki…" przy pustym wątku).
2. Dopisanie kroku → nowy trafia na koniec listy, tuż **nad przypiętym celem**.
3. Każda akcja ma przełącznik typu: **mój ruch** / **czekam na kogoś**. Dla „czekam" dostępna opcjonalna **data dopytania**.
4. Drag & drop układa kolejność wykonania; **cel jest przypięty jako ostatni element** — nie da się go przeciągnąć powyżej końca listy ani go usunąć z tej pozycji.

### Dzień pracy: odhaczanie

1. Skończony „mój ruch" → checkbox → pasek progresu wątku rośnie **od razu i tylko o ten typ**; powstaje małe zwycięstwo w dzienniku.
2. Odhaczenie z powrotem usuwa swój wpis dziennika — bilans dnia wraca do stanu realnego.
3. Akcje „czekam na kogoś" mają swój checkbox (done ⇄ todo), ale na progres nie wpływają.

### Czekam na kogoś / data dopytania

1. Akcja przełącza się na „czekam na kogoś" — karta zbiorczo pokazuje wskaźnik, że wątek jest (częściowo) zablokowany na innych.
2. Ustawiona data dopytania widoczna przy akcji; **po terminie** czerwony znacznik przy akcji + subtelna plakietka na karcie wątku po lewej (np. „1 po terminie") — widać bez otwierania wątku.
3. Bez powiadomień — kontrola należy do użytkownika.

### Domknięcie wątku (moment nagrody)

1. Przycisk **„Domknij"** w nagłówku prawego panelu (obok menu ⋯).
2. Modal celebracyjny: „Cel osiągnięty" + tytuł wątku + informacja, że wpis trafia do dziennika jako **większe zwycięstwo**. Confirm/Anuluj.
3. Po potwierdzeniu wątek znika z otwartej listy i ląduje w sekcji **„Domknięte i porzucone"** na dole; zaznaczenie czyści się, prawy panel wraca do zachęty.
4. Domknięcie jest ręczne i **może nastąpić z niedokończonymi akcjami** — decyzja należycie do celu, nie do checkboxów.

### Porzucenie / usunięcie / przywrócenie

1. Menu ⋯ w nagłówku panelu zawiera **„Porzuć"** i **„Usuń…"** (usuwanie wymaga potwierdzenia, jest destrukcyjne — wpisy dziennika zostają ze snapshotem tekstu).
2. Sekcja zamkniętych (zwinięta, z licznikiem) przy każdej karcie oferuje **Reopen** i **Usuń…**; domknięte i porzucone widać razem, ale ze znakiem statusu.
3. Reopen wraca do listy otwartej — na jej końcu (priorytet układa ręcznie Drag & Drop); historycznych wpisów dziennika nie kasuje.

## Screens (rough)

- **Lewa kolumna — lista wątków**: nagłówek z licznikiem otwartych, inline formularz dodawania (tytuł [+ cel]), lista kart, na dole zwijana sekcja „Domknięte i porzucone (N)". Przewaga: jedna kolumna przewijalna, zero modali przy codziennej pracy.
- **Karta wątku**: tytuł, chipy tagów (+ dobieranie), pasek progresu **lub** etykieta zastępcza (brak akcji „mój ruch"), wskaźnik „czeka na innych N", plakietka „X po terminie" gdy dotyczy.
- **Prawa kolumna — panel akcji**: nagłówek (tytuł klik-to-edit, tagi, przycisk „Domknij", menu ⋯: Porzuć / Usuń…), lista akcji (checkbox, etykieta klik-to-edit, przełącznik typu, data dopytania, handle DnD), **przypięty cel** jako ostatni element (wyróżniony wizualnie, klik-to-edit, nieruchomy w DnD).
- **Panel bez zaznaczenia**: placeholder — ikona/krótka zachęta „Wybierz wątek…" + wskazówka o dodaniu pierwszego, gdy lista też pusta.
- **Modal domknięcia**: nagłówek „Cel osiągnięty”, nazwa wątku, notka o wpisie do dziennika, Confirm/Anuluj; po potwierdzeniu toast z przejściem do Dziennika.
- **Dialog usuwania** (wątek/akcja): ostrzeżenie o destrukcyjności + co zostaje (wpisy dziennika ze snapshotem).
- **Pasek komunikatów systemowych**: toasty informacji/akcji oraz trwały baner błędu zapisu (`AppNotices`) — jedyny kanał awarii storage.
- **Stany ładowania**: szkielety kart przy inicialnym query; pełnoekranowy alert, gdy IndexedDB nie chce się otworzyć.

## Actions

| Action | Description | Entity | Notes |
|--------|------------|--------|-------|
| Add Loop | Inline form nad listą; nowy wątek **na górę** i auto-zaznaczony | Loop | quick capture |
| Edit Loop | Tytuł klik-to-edit (karta i panel) | Loop | |
| Reorder Loops | Drag & drop; ręczny priorytet; kolejność nigdy się nie resetuje | Loop | |
| Select Loop | Klik na kartę → prawa kolumna | Loop | nawigacja, bez zmiany danych |
| Tag Loop / Untag | Chipy na karcie/w panelu; wolne wpisywanie tworzy tag | Loop, Tag | kolor auto z palety |
| Add Action | Na koniec listy, nad przypiętym celem | Action | |
| Edit Action | Etykieta klik-to-edit; przełącznik typu; data dopytania tylko WaitingOn | Action | |
| Toggle Done | Checkbox; mój-ruch napędza progres + wpis dziennika; uncheck usuwa wpis | Action | jedyny pisarz DayEntry |
| Reorder Actions | Drag & drop — plan wykonania | Action | cel przypięty ostatni |
| Delete Action | Potwierdzenie gdy done; bilans dnia aktualizuje się wstecz | Action | |
| Edit Goal | Cel klik-to-edit, także po domknięciu | Goal | |
| Close Loop | CTA w nagłówku panelu → modal „Cel osiągnięty" | Loop | większe zwycięstwo → DayEntry |
| Abandon Loop | Pozycja w menu ⋯; bez wpisu dziennika | Loop | ≠ zwycięstwo |
| Reopen Loop | Z sekcji zamkniętych; wraca na koniec listy otwartej | Loop | dziennik nietknięty |
| Delete Loop | Menu ⋯ lub karta w sekcji; potwierdzenie | Loop | akcje znikają, snapy zostają |

## Edge Cases

*Zachowania rozstrzygnięte i zaimplementowane (harden 2026-08-27 — pełna ewidencja: `workbench-edgecases.md`).*

- **Pierwsze uruchomienie (scenariusz `empty`)**: skupione pole dodawania + podpowiedź lewej kolumny; prawy panel ma wariant first-run „nazwij pierwszy wątek…".
- **Wątek bez akcji albo tylko „czekam na kogoś"**: brak pasa progresu — etykieta stanu; zero sztucznego wypełnienia bara.
- **Progres pełny, wątek nadal otwarty**: legalne — karta pokazuje 100% „mój ruch" bez sugerowania końca wątku.
- **Domknięcie/porzucenie zaznaczonego wątku**: panel natychmiast schodzi do placeholda — nigdy nie edytuje się zamkniętego wątku.
- **Domknięcie z niezakończonymi akcjami**: dozwolone; po sukcesie toast z linkiem do Dziennika.
- **Nieudany zapis** (IndexedDB odmowa/quota): baner błędu zamiast ciszy; formularze zachowują treść, modal domknięcia zostaje otwarty.
- **Aplikacja nie może otworzyć bazy**: pełnoekranowy alert z „Spróbuj ponownie".
- **Podwójny submit**: flaga busy w obu formularzach — duplikaty niemożliwe.
- **Wyścig tworzenia tagu**: unique-indeks dogrywa istniejący rekord.
- **Długie tokeny tekstowe**: chipy tagów łamią wyraz (`overflow-wrap:anywhere`).
- **Cel przy DnD**: ostatnia pozycja zastrzeżona — cel poza sortowalnym kontekstem.
- **Data dopytania w przeszłości przy done**: znacznik tylko dla undone.
- **Pusty tytuł**: inline walidacja blokuje Enter; klik-to-edit nie wypala treści do pustki.
- **Screen reader**: drag & drop ogłaszany po polsku (dnd-kit accessibility override).

## Integration Points

- **data-layer**: wszystkie zapisy (Loop/Action/Goal/Tag) przez repozytoria; wymaga dostępu do listy zamkniętych (sekcja na dole) — dziś repo ma `listOpen()`, do doróbki `listClosed()`/lista statusowa.
- **journal**: workbench jest **jedynym pisarzem** `DayEntry` — `Toggle Done` (małe zwycięstwo) i `Close Loop` (większe); cofnięcia usuwają wpis.
- **tags**: inline tworzenie z workbench zasila wspólną pulę; rename/delete globalne zostaje w mód. tags.
