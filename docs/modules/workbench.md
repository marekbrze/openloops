# Workbench

## Vision

Workbench to ekran główny aplikacji — mapa dnia użytkownika. Lewa kolumna to ręcznie priorytetyzowana lista **otwartych** wątków: nagłówek z samym licznikiem otwartych, żaby zawsze przypięte na szczycie (ADR-0041), karty z licznikiem zwycięstw i otwartych zadań oraz wskaźnikiem „czeka na innych" (bez pasa progresu — ADR-0038), na dole zwijane sekcje **Zwycięstwa** (ADR-0039) i „Domknięte i porzucone". Zaznaczenie wątku otwiera prawą kolumnę: pole dopisywania kroków nad listą, jego akcje z typami, ręczną kolejnością i opcjonalną datą dopytania, z **przypiętym celem zawsze jako ostatnim elementem listy** (ADR-0040). Tu zapada decyzja o domknięciu — chwila nagrody, nie administracji.

*Nota z 2026-08-27: wszelkie wzmianki o tagach wycofane razem z modułem tags (kod usunięty); pierwotne rozstrzygnięcia patrz ADR-0008.*

Zasady kierujące (z wywiadu 2026-08-27):

- **Szybkość przechwytywania ponad formalność** — nowy wątek to pole inline nad listą, nie modal; świeży temat ląduje **na górze**, od razu zaznaczony do rozpisania.
- **Układ dwukolumnowy jest stały** — pusty prawy panel pokazuje zachętę „Wybierz wątek…", nigdy skoku layoutu.
- **Edycja wszędzie klik-to-edit** — drobne poprawki tekstów nie przechodzą przez dialogi; dedykowane przełączniki tylko dla danych strukturalnych (typ akcji, data dopytania). Wyjątek (ADR-0029): karta wątku tylko zaznacza — nazwa edytuje się w panelu.
- **Moment domknięcia jest celebracją** — modal „Cel osiągnięty" nazywa zwycięstwo i mówi, że wpis trafia do dziennika.
- **Licznik zamiast pasa** — lista wątków pokazuje wyłącznie licznik otwartych w nagłówku; karty mówią licznikiem per wątek (🏆 zwycięstwa · otwarte zadania, ADR-0041), a sekcja pucharu gromadzi zwycięstwa z całego świata.

## User Flows

### Przechwycenie nowego wątku

1. User wpisuje tytuł w inline polu nad listą (widocznym zawsze jako pierwszy element lewej kolumny) → opcjonalnie rozwija drugie pole na cel.
2. Enter → nowy wątek pojawia się **na szczycie grupy nie-żab** — poniżej przypiętych żab (ADR-0041) — i zostaje automatycznie zaznaczony.
3. User od razu dopisuje akcje w prawym panelu; cel może zostać dopisany później (edytowalny zawsze).

### Planowanie akcji zaznaczonego wątku

1. Zaznaczenie karty wątku → prawy panel pokazuje jego akcje (albo zachętę „rozpisz kroki…" przy pustym wątku).
2. Dopisanie kroku w polu **nad listą** (ADR-0040) → nowy trafia na koniec grupy otwartych, tuż **nad przypiętym celem**.
3. Każda akcja ma przełącznik typu: **mój ruch** / **czekam na kogoś**. Dla „czekam" dostępna opcjonalna **data dopytania**.
4. Drag & drop układa kolejność wykonania; **cel jest przypięty jako ostatni element** — nie da się go przeciągnąć powyżej końca listy ani go usunąć z tej pozycji.

### Dzień pracy: odhaczanie

1. Skończona akcja → checkbox → natychmiast znika z listy otwartych panelu, wpada do sekcji **Wykonane** (ADR-0040) i na listę **Zwycięstw** (ADR-0039); licznik na karcie wątku skacze o jeden (🏆), powstaje małe zwycięstwo w dzienniku.
2. Odhaczenie z powrotem usuwa swój wpis dziennika — bilans dnia wraca do stanu realnego, a akcja wraca na dawne miejsce wśród otwartych.
3. Akcje „czekam na kogoś" mają swój checkbox (done ⇄ todo) — zrobione trafiają do tej samej sekcji Wykonane.
4. Auto-sort (ADR-0030): zrobione natychmiast **zjeżdżają na dół** — od ADR-0040 do zwiniętej sekcji na końcu.

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

- **Lewa kolumna — lista wątków**: nagłówek z licznikiem otwartych, inline formularz dodawania (tytuł [+ cel]), lista kart z żabami przypiętymi na szczycie (ADR-0041), na dole zwijane sekcje „Zwycięstwa (N)" (ADR-0039) i „Domknięte i porzucone (N)". Przewaga: jedna kolumna przewijalna, zero modali przy codziennej pracy.
- **Karta wątku**: tytuł (statyczny — klik zaznacza, ADR-0029), żaba wyróżniona całą kartą — zielony glif + tinta tła `bg-success/10` i hairline `border-success/40` (ADR-0037); w **tej samej linii co tytuł, wyrównane do prawej**: licznik per wątek 🏆 zwycięstwa (tinta success tylko przy > 0) · otwarte zadania (ADR-0041) **bez pasa progresu** (ADR-0038), wskaźnik „czeka", plakietka „X po terminie"; „rozpisz kroki…" przy zerze akcji (też po prawej). Tytuł robi truncate, klaster prawy jest shrink-0.
- **Prawa kolumna — panel akcji**: nagłówek (tytuł klik-to-edit, przycisk „Domknij", menu ⋯: Żaba / Porzuć / Usuń…), pole dopisywania kroków **nad listą** (ADR-0040), lista akcji otwartych (checkbox, etykieta klik-to-edit, przełącznik żaby, przełącznik typu, data dopytania, przełącznik „Teraz", handle DnD), zwinięta sekcja „Wykonane (N)", **przypięty cel** jako ostatni element (wyróżniony wizualnie, klik-to-edit, nieruchomy w DnD).
- **Panel bez zaznaczenia**: placeholder — ikona/krótka zachęta „Wybierz wątek…" + wskazówka o dodaniu pierwszego, gdy lista też pusta.
- **Modal domknięcia**: nagłówek „Cel osiągnięty”, nazwa wątku, notka o wpisie do dziennika, Confirm/Anuluj; po potwierdzeniu toast z przejściem do Dziennika.
- **Dialog usuwania** (wątek/akcja): ostrzeżenie o destrukcyjności + co zostaje (wpisy dziennika ze snapshotem).
- **Pasek komunikatów systemowych**: toasty informacji/akcji oraz trwały baner błędu zapisu (`AppNotices`) — jedyny kanał awarii storage.
- **Stany ładowania**: szkielety kart przy inicialnym query; pełnoekranowy alert, gdy IndexedDB nie chce się otworzyć.

## Actions

| Action | Description | Entity | Notes |
|--------|------------|--------|-------|
| Add Loop | Inline form nad listą; nowy wątek **na szczyt grupy nie-żab** (poniżej żab — ADR-0041) i auto-zaznaczony | Loop | quick capture |
| Edit Loop | Tytuł klik-to-edit — tylko w panelu (ADR-0029) | Loop | karta nie edytuje |
| Reorder Loops | Drag & drop — tylko oś pionowa (ADR-0042); ręczny priorytet; kolejność nigdy się nie resetuje | Loop | |
| Select Loop | Klik na kartę → prawa kolumna | Loop | nawigacja, bez zmiany danych |
| Mark/Unmark Frog (Loop) | Menu ⋯ nagłówka panelu; oznaczenie = **stała pinacja na szczycie** listy otwartych (ADR-0041, amend ADR-0037), zdjęcie wraca do ręcznej kolejności | Loop | zielony glif żaby na karcie; flagę czyszczą domknięcie/porzucenie (ADR-0037) |
| Add Action | Pole nad listą (ADR-0040); nowy na koniec grupy otwartych | Action | |
| Edit Action | Etykieta klik-to-edit; przełącznik typu; data dopytania tylko WaitingOn | Action | |
| Mark/Unmark Frog (Action) | Przycisk-ikona w wierszu akcji; disabled dla done | Action | akcja-żaba dokładana do Teraz ląduje na szczycie kolejki; oznaczona w kolejce wskakuje na szczyt; odhaczenie czyści flagę (ADR-0037) |
| Toggle Done | Checkbox; licznik karty, wpis dziennika, sekcja Wykonane i lista Zwycięstw; uncheck cofa wszystko | Action | jedyny pisarz DayEntry; done zjeżdża do zwiniętej sekcji (ADR-0030/0040) |
| Reorder Actions | Drag & drop — tylko oś pionowa (ADR-0042); plan wykonania wewnątrz grup (otwarte / zrobione) | Action | cel przypięty ostatni |
| Delete Action | Potwierdzenie gdy done; bilans dnia aktualizuje się wstecz | Action | |
| Edit Goal | Cel klik-to-edit, także po domknięciu | Goal | |
| Close Loop | CTA w nagłówku panelu → modal „Cel osiągnięty" | Loop | większe zwycięstwo → DayEntry |
| Abandon Loop | Pozycja w menu ⋯; bez wpisu dziennika | Loop | ≠ zwycięstwo |
| Reopen Loop | Z sekcji zamkniętych; wraca na koniec listy otwartej | Loop | dziennik nietknięty |
| Delete Loop | Menu ⋯ lub karta w sekcji; potwierdzenie | Loop | akcje znikają, snapy zostają |

## Edge Cases

*Zachowania rozstrzygnięte i zaimplementowane (harden 2026-08-27 — pełna ewidencja: `workbench-edgecases.md`).*

- **Pierwsze uruchomienie (scenariusz `empty`)**: skupione pole dodawania + podpowiedź lewej kolumny; prawy panel ma wariant first-run „nazwij pierwszy wątek…".
- **Wątek bez akcji**: „rozpisz kroki…" bez licznika; **wątek z akcjami** — licznik per wątek zawsze widoczny, w tym uczciwe zero (🏆 0 bez zieleni, ADR-0041/0017).
- **Wszystkie akcje zrobione, wątek nadal otwarty**: legalne — „🏆 N · 0 otwartych zadań"; domknięcie należy do celu, nie do checkboxów.
- **Żaby na liście** (ADR-0041): przypięte nad zawsze nad nie-żabami; przeciągnięcie żaby w dół zapisuje się, ale widok wraca do pinacji przy renderze; nowy wątek ląduje pod grupą żab; drag wewnątrz grup działa normalnie.
- **Domknięcie/porzucenie zaznaczonego wątku**: panel natychmiast schodzi do placeholda — nigdy nie edytuje się zamkniętego wątku.
- **Domknięcie z niezakończonymi akcjami**: dozwolone; po sukcesie toast z linkiem do Dziennika.
- **Nieudany zapis** (IndexedDB odmowa/quota): baner błędu zamiast ciszy; formularze zachowują treść, modal domknięcia zostaje otwarty.
- **Aplikacja nie może otworzyć bazy**: pełnoekranowy alert z „Spróbuj ponownie".
- **Podwójny submit**: flaga busy w obu formularzach — duplikaty niemożliwe.
- **Cel przy DnD**: ostatnia pozycja zastrzeżona — cel poza sortowalnym kontekstem.
- **Data dopytania w przeszłości przy done**: znacznik tylko dla undone.
- **Pusty tytuł**: inline walidacja blokuje Enter; klik-to-edit nie wypala treści do pustki.
- **Screen reader**: drag & drop ogłaszany po polsku (dnd-kit accessibility override).
- **Żaba** (ADR-0037): oznaczenie to jednorazowy skok na górę — drag & drop dalej wygrywa po fakcie; zdjęcie żaby nie przestawia niczego; toggle disabled dla done; domknięcie/porzucenie czyszczą flagę (reopen nie przywraca żaby).
- **Zwycięstwa** (ADR-0039): zwinięta domyślnie; zero zrobionych akcji = rozwinięcie mówi „Jeszcze pusto”; odhaczenie wstecz znika z listy natychmiast (liveQuery); zwycięstwa domkniętych wątków zostają (tytuły z obu list).
- **Wykonane** (ADR-0040): sekcja tylko gdy coś jest zrobione; zwinięta wyłącza wiersze z DnD — planują się widoczne; odhaczenie wraca na listę otwartych, usunięcie done nadal za potwierdzeniem.

## Integration Points

- **data-layer**: wszystkie zapisy (Loop/Action/Goal) przez repozytoria; wymaga dostępu do listy zamkniętych (sekcja na dole) — dziś repo ma `listOpen()`, do doróbki `listClosed()`/lista statusowa.
- **journal**: workbench jest **jedynym pisarzem** `DayEntry` — `Toggle Done` (małe zwycięstwo) i `Close Loop` (większe); cofnięcia usuwają wpis.
