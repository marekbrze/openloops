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
| Toggle Done | Odhaczenie skończonej akcji / odhaczenie z powrotem | Owner | check = małe zwycięstwo → wpis dziennika; uncheck = wpis znika, bilans dnia wraca do stanu realnego |
| Reorder Actions | Ręczna kolejność działań drag & drop — plan wykonania | Owner | cel (`Goal`) przypięty jako ostatni element; nie da się go przeciągnąć powyżej końca listy |
| Delete Action | Usunięcie pojedynczego kroku z wątku | Owner | destrukcyjne, wymaga potwierdzenia gdy done; bilans dnia traci jej bieżące zwycięstwo (akcji nie ma ⇒ nie była wykonana); snapy z poprzednich dni zostają |

### Goal

| Action | Description | Role | Notes |
|--------|------------|------|-------|
| Edit Goal | Dopisanie/zmiana opisu „po czym wiem, że gotowe" | Owner | edytowalny zawsze, także po domknięciu |
| Pin at End (system) | Cel zawsze renderowany jako ostatni element listy działań | System | wyłącza go z drag & drop poza pozycję końcową |

### DayLog / WeekSummary (widok Dziennik)

Dziennik jest agregacją `DayEntry` — użytkownik nie tworzy wpisów wprost; log zasilają zdarzenia (`Toggle Done`, `Close Loop`).

| Action | Description | Role | Notes |
|--------|------------|------|-------|
| Open Journal | Przejście do osobnego widoku Dziennik z głównego ekranu | Owner | nawigacja zakładką/przełącznikiem widoku |
| Navigate Weeks | Strzałki ← / → między tygodniami; skrót „dziś” | Owner | wstecz bez limitu; naprzód zatrzymuje się na bieżącym tygodniu (ADR-0015) |
| Read Weekly Balance | Bilans całego tygodnia: ile małych zwycięstw (akcje) i większych (domknięte wątki) | Owner | cele motywacyjne systemu — widoczne od razu |
| Browse Day Entries | Rozwinięcie dnia: lista wykonanych akcji i domkniętych wątków z godzinami | Owner | wpisy mają snapshoty tekstu, czytelne także po usunięciu źródła |
