# Tasks (Zadania)

## Vision

Katalog wszystkich zadań: **akcje otwartych wątków pogrupowane po wątku** — jedna powierzchnia, na której widać cały koszt rozpisanej pracy i da się szybko wybrać „co robię dalej". Rola modułu jest celowo wąska: **tylko czytanie i wybór** (ADR-0022). Edycja treści, typów i usuwanie zostają w workbench, więc mutacje struktury mają jedno miejsce; wybór do pracy dnia dzieje się tu przełącznikiem „Teraz" (i równolegle w workbench — ta sama kontrolka, to samo znaczenie).

Zasady kierujące:

- **Grupowanie po wątku to nagłówek, nie kontener** — tytuł wątku z bilansem `done/total` otwiera sekcję; kolejność grup = ręczny priorytet wątków z lewej kolumny workbench.
- **Zero edycji treści** — etykieta nie jest klik-to-edit; typ („mój ruch”/„czekam”) i po-terminie czytane, nigdzie tu nie przełączane.
- **Wybór jest toggle-em, nie checkboxem** — checkboxa (znaczenie „wykonane”) świadomie brak: katalog nie robi dziennika; przełącznik dokłada/zdejmuje z kolejki Teraz.
- **Done nie wraca do planowania** — akcje skończone widoczne są skreślone z wyłączonym przełącznikiem.

## User Flows

### Przegląd katalogu

1. Zakładka **„Zadania”**: lista grup po porządku priorytetu wątków; pod nagłówkiem ekranu stały licznik „N do zrobienia”.
2. Grupa: nagłówek (tytuł + done/total) i wiersze akcji w ręcznej kolejności wykonania z danego wątku.

### Wybór do Teraz

1. Kliknięcie przełącznika przy akcji → `nowRepo.add` (dolepia na koniec kolejki); aktywny stan pokazuje ikonę zdejmowania i aria-pressed=true.
2. Ponowne kliknięcie zdejmuje (`nowRepo.removeByActionId`). Stan jest wspólny dla całej aplikacji — ta sama akcja wygląda wybrana także w workbench, a ekran Teraz odświeża się natychmiast (liveQuery).
3. Przejście dalej: CTA stanu pustego prowadzi do workbench/creating flows; po wyborach użytkownik sam przeskakuje na „Teraz”.

## Screens (rough)

- **Nagłówek ekranu**: „Wszystkie zadania” + licznik do zrobienia; jedna linia podpowiedzi roli przełącznika.
- **Grupa wątku**: nagłówek z bilansem `done/total` nad listą wierszy.
- **Wiersz zadania**: [przełącznik Teraz] · etykieta · typ · plakietka „po terminie” (gdy dotyczy).
- **Stany specjalne**: szkielet ładowania; karta błędu odczytu z retry; pusty świat; wątki bez kroków.

## Actions

| Action | Description | Entity | Notes |
|--------|------------|--------|-------|
| Browse Catalog | Wszystkie akcje otwartych wątków pogrupowane po wątku | Loop × Action | tylko odczyt |
| Pick For Now / Unpick | Toggle dołączenia do kolejki Teraz | NowItem | disabled dla done; wspólny stan z workbench (`usePickedActionIds`) |
| Open Workbench | Z stanów pustych | — | zdarzenie `openloops:navigate` |

## Edge Cases

*Rozstrzygnięte projektowo 2026-08-27:*

- **Brak otwartych wątków** → pusty katalog z CTA do workbench (świat świeży albo wyczerpany).
- **Wątki bez ani jednej akcji** → osobny komunikat „rozpisz kroki w workbench” — nie myli się ze światem pustym.
- **Membership jeszcze nieczytelny** (pierwszy render liveQuery) → przełączniki disabled zamiast pokazywać fałszywy stan nieaktywny.
- **Akcja usunięta w workbench, gdy leży w kolejce** → kaskada ADR-0021 czyści pozycję Teraz; katalog naturalnie traci wiersz.
- **Done-akcje**: widoczne jako skreślone, przełącznik wyłączony (nie da się wybrać czegoś już skończonego).
- **Porażka odczytu IndexedDB** → karta alert z „Spróbuj ponownie”, konwencja dziennika/Teraz.
- **Długie etykiety / długi tytuł wątku** → truncation jednowierszowy (spójnie z resztą systemu).

## Integration Points

- **data-layer**: odczyt `loops(status=open, sortOrder)` × wszystkie `actions`; mutacje wyboru wyłącznie przez `nowRepo`.
- **now (Teraz)**: dzieli hook `usePickedActionIds` i semantykę przełącznika; katalog nie przechowuje własnego stanu wyboru.
- **workbench**: granica ról — tu czytanie/wybór, tam autoryzacja struktury (edycja, typy, dopytania, usuwanie).
