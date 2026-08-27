# Entity Map

## Diagram

```mermaid
erDiagram
    LOOP ||--|| GOAL : "defines"
    LOOP ||--o{ ACTION : "contains"
    LOOP ||--o{ DAY_ENTRY : "wins-of"
    ACTION ||--o{ DAY_ENTRY : "wins-of"
    ACTION ||--o| NOW_ITEM : "queued-for-today"

    LOOP {
        string id PK
        string title
        int sort_order "reczny priorytet drag-and-drop; nowy wpis trafia na gore"
        enum status "open | closed | abandoned"
        datetime created_at
        datetime closed_at
        datetime abandoned_at
    }
    GOAL {
        string id PK
        string loop_id FK
        string text "po czym wiem ze gotowe"
        int sort_order "zawsze ostatni element listy"
    }
    ACTION {
        string id PK
        string loop_id FK
        string label
        enum owner_type "MyMove | WaitingOn"
        date follow_up_date "opcjonalna tylko dla WaitingOn"
        bool done
        datetime done_at
        int sort_order "reczny drag-and-drop"
    }
    DAY_ENTRY {
        string id PK
        enum kind "action-done | loop-closed"
        string loop_id FK "snapshot tytulu"
        string action_id FK "null dla loop-closed"
        string snapshot_text "zyje po usunieciu zrodla"
        date day_key "lokalna data zdarzenia"
        datetime created_at
    }
    NOW_ITEM {
        string id PK "deterministyczny: now:actionId - toggle idempotentny"
        string action_id FK "wskaźnik; zero kopii tresci"
        int sort_order "reczna kolejka ekranu Teraz"
        datetime added_at
        datetime created_at
    }
```

Uwaga modelowa: „wątek zablokowany na innych" nie jest polem — jest **pochodną** (`derived`): Loop jest blocked, gdy ma co najmniej jedną akcję `WaitingOn` niezakończoną. Dziennik (`DayLog`) też nie jest tabelą — to **agregacja** `DAY_ENTRY` po `day_key` do widoku dnia i tygodnia. Kolejka „Teraz" (`NowItem`, ADR-0021) to wskaźnik, nie kopia: treść czyta się na żywo z `ACTION`; rekord nie przeżywa usunięcia/domknięcia/porzucenia źródła (kaskady w repozytoriach).

## Entities

### Loop
**Description**: Otwarty wątek roboczy — podstawowa jednostka pracy. Zbiera akcje prowadzące do celu i ręczny priorytet na głównej liście.
**Instances per user**: Many (kilkanaście–dziesiątki jednocześnie otwartych).
**Ownership**: User (aplikacja single-user, brak encji User w danych).
**Lifecycle**: Powstaje w momencie dodania tematu; żyje jako `open`, aż użytkownik ręcznie go domknie (`closed`) albo porzuci (`abandoned`). Domknięte/porzucone można otworzyć ponownie; każdy wątek może być trwale usunięty wraz z zawartością.
**States**: `open` → `closed` (domknięcie ręczne przez osiągnięty cel — duże zwycięstwo w dzienniku), `open` → `abandoned` (porzucenie — nie jest zwycięstwem), `closed | abandoned` → `open` (przywrócenie).
**Contains**: Action (1:N), Goal (1:1), DayEntry (1:N jako źródło zdarzeń). *(Relacja M:N z Tag usunięta 2026-08-27 razem z wycofaniem modułu tags.)*
**Belongs to**: nic — wierzchołek grafu.

### Goal
**Description**: Krótki opis stanu „po czym wiem, że gotowe". Warunek domknięcia wątku.
**Instances per user**: Dokładnie jeden na Loop (relacja kompozycji — żyje i umiera z wątkiem).
**Ownership**: User (przez wątek).
**Lifecycle**: Tworzony razem z wątkiem (może zacząć pusty i zostać dopisany), edytowalny zawsze.
**States**: brak własnych stanów — wizualizacja „osiągnięto/nie osiągnięto" wynika ze statusu Loop.
**Contains**: —
**Belongs to**: Loop (1:1). **Wymóg UX**: renderowany jako ostatni element listy działań, przypięty — nie podlega przeciąganiu poza koniec.

### Action
**Description**: Konkretny krok do podjęcia w ramach wątku. Ma właściciela-zdarzenia: `MyMove` (mój ruch — liczy się do progresu) lub `WaitingOn` (czekam na kogoś — nie liczy się do progresu, może mieć datę dopytania).
**Instances per user**: Wiele na wątek (0–N).
**Ownership**: User (przez wątek).
**Lifecycle**: Dodana do wątku; przełącza `done`; usuwalna pojedynczo; znika z wątkiem przy twardym usunięciu.
**States**: `todo` ⇄ `done`. Odhaczenie **usuwa** powiązany wpis zwycięstwa z dziennika (bilans dnia wraca do stanu realnego).
**Contains**: —
**Belongs to**: Loop (1:N, sortowana ręcznie — `sort_order`).

### DayEntry
**Description**: Pojedynczy wpis zwycięstwa w dzienniku: skończona akcja (małe zwycięstwo) albo domknięty wątek (większe zwycięstwo). Trzyma snapshot tekstu, żeby historia była czytelna nawet po edycji/usunięciu źródła.
**Instances per user**: Wiele, append-log z jednym wyjątkiem (cofnięcie odhaczenia usuwa swój wpis).
**Ownership**: System (zapisuje automatycznie po zdarzeniach użytkownika — user nie tworzy wpisów wprost).
**Lifecycle**: Powstaje w chwili zdarzenia (akcja odhaczona / wątek domknięty); usuwany gdy odhacisz akcję z powrotem; przetrwa niezależnie od późniejszego twardego usunięcia wątku dzięki snapshotowi.
**States**: brak — rekord zdarzenia.
**Contains**: —
**Belongs to**: Loop i/lub Action (referencja + snapshot). Agregowany do **WeekSummary** (widok dziennika: nawigacja po tygodniu, bilans tygodnia, dzień po dniu).

### NowItem
**Description**: Pozycja kolejki ekranu Teraz — wskaźnik „ta akcja pracuje dziś". Tylko referencja (`actionId`) i ręczny porządek; treść/status zawsze żyją w Action/Loop.
**Instances per user**: Niezduplikowane — dokładnie najwyżej jeden rekord na akcję (deterministyczny klucz czyni toggle idempotentnym).
**Ownership**: User (ręką przełącznika „Teraz" na liście Zadania lub w panelu workbench).
**Lifecycle**: Powstaje przy doklejeniu na koniec kolejki (ADR-0023); znika świadomie (X / masowe „zdejmij zrobione") albo kaskadowo razem ze źródłem — usunięcie akcji, twarde usunięcie wątku, jego domknięcie czy porzucenie czyszczą pozycje (ADR-0021). Reopen wątku nie odtwarza zdjętych pozycji.
**States**: brak własnych stanów — skreślenie (done) czytane z akcji, kolejność to dane samego rekordu.
**Contains**: —
**Belongs to**: Action (N:1 przez `actionId`). Widoczność ograniczona żywą kwerendą modułu now (join + filtr obronny).
