# Action Inventory

Complete list of actions users can perform, organized by entity.

## Roles

- **Owner** (użytkownik): jedyna rola. Aplikacja single-user, local-first — bez kont, bez współdzielenia.

## Actions

### Loop

| Action | Description | Role | Notes |
|--------|------------|------|-------|
| Add Loop | Przechwycenie nowego otwartego tematu: tytuł + (opcjonalnie od razu) cel | Owner | inline form nad listą (bez modala); **nowy trafia na górę** i zostaje auto-zaznaczony |
| Edit Loop | Zmiana tytułu klik-to-edit (karta i panel); zmiana treści celu przez edycję Goal | Owner | konwencja: teksty bez dialogów |
| Reorder Loops | Ręczne ustawienie priorytetów drag & drop na liście po lewej | Owner | `sort_order`; kolejność nie resetuje się sama |
| Select Loop | Zaznaczenie wątku otwiera jego akcje w prawym panelu | Owner | akcja nawigacyjna — nie zmienia danych; przy braku zaznaczenia panel pokazuje zachętę |
| Close Loop | Ręczne domknięcie: „cel osiągnięty". open → closed | Owner | CTA w nagłówku panelu → **modal celebracyjny** z notką o wpisie do dziennika; nie wymaga odhaczonych wszystkich akcji; **większe zwycięstwo** |
| Abandon Loop | Świadome porzucenie tematu. open → abandoned | Owner | pozycja w menu ⋯ nagłówka panelu; nie jest zwycięstwem |
| Reopen Loop | Przywrócenie domkniętego lub porzuconego wątku → open | Owner | dostęp z sekcji „Domknięte i porzucone"; wraca na **koniec** listy otwartej; wpisów dziennika nie kasuje |
| Delete Loop | Trwałe usunięcie wątku razem z akcjami i celem | Owner | menu ⋯ lub karta sekcji zamkniętych; destrukcyjne, wymaga potwierdzenia; wpisy dziennika zostają ze snapshotem tekstu |

### Action

| Action | Description | Role | Notes |
|--------|------------|------|-------|
| Add Action | Dopisanie kroku do zaznaczonego wątku | Owner | nowa trafia na koniec listy (nad przypiętym celem) |
| Edit Action | Zmiana etykiety klik-to-edit; przełączenie typu mój ruch ⇄ czekam na kogoś; ustawienie/usunięcie daty dopytania | Owner | data dopytania tylko dla WaitingOn; po terminie znacznik przy akcji + plakietka na karcie wątku |
| Toggle Done | Odhaczenie skończonej akcji / odhaczenie z powrotem | Owner | check = małe zwycięstwo → wpis dziennika; uncheck = wpis znika, bilans dnia wraca do stanu realnego; dostępne w workbench **i** na ekranie Teraz — ta sama semantyka |
| Pick For Now / Unpick | Dołączenie akcji do kolejki Teraz / zdjęcie z niej | Owner | drugi przełącznik obok checkboxa (ADR-0022) — w modalu Zadania na Teraz i w panelu workbench; disabled dla done; dokleja na koniec kolejki (ADR-0023); `nowRepo` jest jedynym pisarzem |
| Reorder Actions | Ręczna kolejność działań drag & drop — plan wykonania | Owner | cel (`Goal`) przypięty jako ostatni element; nie da się go przeciągnąć powyżej końca listy |
| Delete Action | Usunięcie pojedynczego kroku z wątku | Owner | destrukcyjne, wymaga potwierdzenia gdy done; bilans dnia traci jej bieżące zwycięstwo (akcji nie ma ⇒ nie była wykonana); snapy z poprzednich dni zostają; kaskadowo czyści pozycję Teraz |

### Goal

| Action | Description | Role | Notes |
|--------|------------|------|-------|
| Edit Goal | Dopisanie/zmiana opisu „po czym wiem, że gotowe" | Owner | edytowalny zawsze, także po domknięciu |
| Pin at End (system) | Cel zawsze renderowany jako ostatni element listy działań | System | wyłącza go z drag & drop poza pozycję końcową |

### NowItem / kolejka „Teraz" (widok Teraz)

Kolejka żyje na wskaźnikach (`now:${actionId}`); treść czytana na żywo ze źródła. Kaskady: usunięcie akcji/nowego wątku/domknięcie/porzucenie czyszczą pozycje automatycznie; reopen nie odtwarza.

| Action | Description | Role | Notes |
|--------|------------|------|-------|
| Open Now | Zakładka „Teraz" — widok startowy aplikacji (ADR-0020) | Owner | nawigacja tobaru |
| Read Day | Dzisiejsza data z dniem tygodnia + żywy zegar HH:MM + meta liczności kolejki | Owner | czas lokalny pl-PL; dogania północ/uśpienie karty |
| Reorder Queue | Drag & drop pozycji — plan wykonania dnia; numeracja widoczna | Owner | dotyczy tylko kolejki; źródła nietknięte |
| Toggle Done in Queue | Odhaczenie akcji prosto z Teraz | Owner | identyczna ścieżka jak Toggle Done w workbench → wpis dziennika |
| Remove From Queue | Zdjęcie pojedynczej pozycji (X) — źródło zostaje nietknięte | Owner | done-akcje zostają skreślone aż do świadomego zdjęcia (ADR-0023) |
| Remove Done In Bulk | „Zdejmij zrobione (n)" — masowe oczyszczenie kolejki | Owner | CTA pojawia się gdy ≥1 pozycja done |
| Open Task Picker | Otwarcie modalu „Wybierz zadania" nad własnym ekranem (ADR-0024) | Owner | przycisk nagłówka + CTA stanu pustego „nic nie wybrane"; zamykanie X / Esc / klik w tło |

### TaskCatalog (modal „Wybierz zadania" na Teraz)

Katalog wszystkich zadań: czytanie + wybór. Bez edycji treści, typów ani usuwania — to domena workbench (ADR-0022). Od ADR-0024 nie jest zakładką — modal osadzony na ekranie Teraz; stan otwarcia trzyma Teraz.

| Action | Description | Role | Notes |
|--------|------------|------|-------|
| Browse Catalog | Akcje otwartych wątków pogrupowane po wątku, w ich ręcznej kolejności | Owner | grupy wg priorytetu wątków; licznik „N do zrobienia"; scroll wewnątrz panelu |
| Pick For Now / Unpick | Przełącznik przy każdym wierszu — ten sam co w workbench/Teraz | Owner | wspólny stan przez `usePickedActionIds`; disabled gdy done albo członkostwo jeszcze nieczytelne; kolejka pod spodem odświeża się na żywo |
| Open Workbench | Z stanów pustych (świat pusty / wątki bez kroków) | Owner | zamyka modal przed nawigacją; zdarzenie `openloops:navigate` |

### DayLog / WeekSummary (widok Dziennik)

Dziennik jest agregacją `DayEntry` — użytkownik nie tworzy wpisów wprost; log zasilają zdarzenia (`Toggle Done`, `Close Loop`).

| Action | Description | Role | Notes |
|--------|------------|------|-------|
| Open Journal | Przejście do osobnego widoku Dziennik z głównego ekranu | Owner | nawigacja zakładką/przełącznikiem widoku |
| Navigate Weeks | Strzałki ← / → między tygodniami; skrót „dziś” | Owner | wstecz bez limitu; naprzód zatrzymuje się na bieżącym tygodniu (ADR-0015) |
| Read Weekly Balance | Bilans całego tygodnia: ile małych zwycięstw (akcje) i większych (domknięte wątki) | Owner | cele motywacyjne systemu — widoczne od razu |
| Browse Day Entries | Rozwinięcie dnia: lista wykonanych akcji i domkniętych wątków z godzinami | Owner | wpisy mają snapshoty tekstu, czytelne także po usunięciu źródła |
