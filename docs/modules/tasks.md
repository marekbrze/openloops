# Tasks (Zadania)

## Vision

Katalog wszystkich zadań: **akcje otwartych wątków pogrupowane po wątku** — jedna powierzchnia, na której widać cały koszt rozpisanej pracy i da się szybko wybrać „co robię dalej". Od 2026-08-27 (ADR-0024) katalog **nie jest zakładką** — jest **modalnym wybierakiem zadań osadzonym na ekranie Teraz**, otwieranym przyciskiem „Wybierz zadania". Dobieranie pracy do kolejki dzieje się bez opuszczania głównego ekranu; wybór wskakuje do kolejki na żywo (liveQuery).

Rola modułu jest celowo wąska: **tylko czytanie i wybór** (ADR-0022). Edycja treści, typów i usuwanie zostają w workbench, więc mutacje struktury mają jedno miejsce; wybór do pracy dnia dzieje się tu przełącznikiem „Teraz" (i równolegle w workbench — ta sama kontrolka, to samo znaczenie).

Zasady kierujące:

- **Modal, nie zakładka** — katalog jest pod-akcją Teraz; otwarcie nie zmienia widoku, zamknięcie wraca do nietkniętej kolejki.
- **Grupowanie po wątku to nagłówek, nie kontener** — tytuł wątku z bilansem `done/total` otwiera sekcję; kolejność grup = ręczny priorytet wątków z lewej kolumny workbench.
- **Zero edycji treści** — etykieta nie jest klik-to-edit; typ („mój ruch”/„czekam”) i po-terminie czytane, nigdzie tu nie przełączane.
- **Wybór jest toggle-em, nie checkboxem** — checkboxa (znaczenie „wykonane”) świadomie brak: katalog nie robi dziennika; przełącznik dokłada/zdejmuje z kolejki Teraz.
- **Done nie wraca do planowania** — akcje skończone widoczne są skreślone z wyłączonym przełącznikiem.

## User Flows

### Otwarcie i przegląd katalogu

1. Na ekranie Teraz kliknięcie przycisku **„Wybierz zadania”** (nagłówek, zawsze dostępny) otwiera modal: nagłówek „Wybierz zadania" z licznikiem „N do zrobienia" i X; poniżej grupy po porządku priorytetu wątków.
2. Grupa: nagłówek (tytuł + done/total) i wiersze akcji w ręcznej kolejności wykonania z danego wątku. Długi katalog scrolluje się wewnątrz panelu.

### Wybór do Teraz

1. Kliknięcie przełącznika przy akcji → `nowRepo.add` (dolepia na koniec kolejki); aktywny stan pokazuje ikonę zdejmowania i aria-pressed=true. Kolejka pod spodem odświeża się natychmiast (liveQuery).
2. Ponowne kliknięcie zdejmuje (`nowRepo.removeByActionId`). Stan jest wspólny dla całej aplikacji — ta sama akcja wygląda wybrana także w workbench.
3. Zamknięcie (X / Esc / klik w tło) wraca na Teraz z gotową, zaktualizowaną kolejką — wybory są już zapisane, nic się nie gubi.

### Stany puste → workbench

1. CTA stanów pustych (świeży świat / wątki bez kroków) zamyka modal i prowadzi do workbench.

## Screens (rough)

- **Modal „Wybierz zadania"**: nagłówek (tytuł + licznik do zrobienia + X); panel ~`max-w-2xl`, wewnętrzny scroll.
- **Grupa wątku**: nagłówek z bilansem `done/total` nad listą wierszy.
- **Wiersz zadania**: [przełącznik Teraz] · etykieta · typ · plakietka „po terminie" (gdy dotyczy).
- **Stany specjalne**: szkielet ładowania; karta błędu odczytu z retry; pusty świat; wątki bez kroków.

## Actions

| Action | Description | Entity | Notes |
|--------|------------|--------|-------|
| Browse Catalog | Wszystkie akcje otwartych wątków pogrupowane po wątku | Loop × Action | tylko odczyt |
| Pick For Now / Unpick | Toggle dołączenia do kolejki Teraz | NowItem | disabled dla done; wspólny stan z workbench (`usePickedActionIds`) |
| Open Task Picker | Otwarcie modalu z ekranu Teraz | — | przycisk w nagłówku + CTA stanu pustego Teraz |
| Open Workbench | Z stanów pustych modalu | — | zamyka modal, zdarzenie `openloops:navigate` |

## Edge Cases

*Rozstrzygnięte projektowo 2026-08-27:*

- **Esc / klik w tło w trakcie wyboru** → wybory są już zapisane w repo (każdy toggle = zapis); zamknięcie niczego nie cofa, focus wraca do przycisku otwierającego (natywny `<dialog>`).
- **Brak otwartych wątków** → pusty katalog z CTA do workbench (świat świeży albo wyczerpany); CTA zamyka modal przed nawigacją.
- **Wątki bez ani jednej akcji** → osobny komunikat „rozpisz kroki w workbench" — nie myli się ze światem pustym.
- **Membership jeszcze nieczytelny** (pierwszy render liveQuery) → przełączniki disabled zamiast pokazywać fałszywy stan nieaktywny.
- **Akcja usunięta w workbench, gdy leży w kolejce** → kaskada ADR-0021 czyści pozycję Teraz; katalog naturalnie traci wiersz — również w otwartym modalu.
- **Done-akcje**: widoczne jako skreślone, przełącznik wyłączony (nie da się wybrać czegoś już skończonego).
- **Porażka odczytu IndexedDB** → karta alert z „Spróbuj ponownie", konwencja dziennika/Teraz.
- **Długi katalog / długie etykiety** → scroll wewnątrz panelu modalu (bez rozciągania strony); truncation jednowierszowy etykiet (spójnie z resztą systemu).

*Z hardenu 2026-08-27 (ADR-0028, ewidencja: `tasks-edgecases.md`):*

- **Porażka zapisu w modalu** → baner błędu w top layer (`AppNotices` jako `popover="manual"`) — widoczny NAD modalnym dialogiem; porażka pick/unpick nie milczy.
- **Licznik „N do zrobienia"** → renderowany dopiero z danymi (nie kłamie „0" przy szkielecie).
- **Długi tytuł wątku w grupie** → truncation jednowierszowy z `title=`; bilans `done/total` zostaje na miejscu.
- **Retry karty błędu** → odgrzewa i katalog, i członkostwo (wspólny retry-token); rippling: przełączniki w workbench bezpieczne na sentinelu.

## Integration Points

- **now (Teraz)**: modal żyje na ekranie Teraz — moduł dostarcza treść, ekran wyzwalacz; dzielą hook `usePickedActionIds`; katalog nie przechowuje własnego stanu wyboru ani stanu otwarcia (stan otwarcia = Teraz).
- **data-layer**: odczyt `loops(status=open, sortOrder)` × wszystkie `actions`; mutacje wyboru wyłącznie przez `nowRepo`.
- **workbench**: granica ról — tu czytanie/wybór, tam autoryzacja struktury (edycja, typy, dopytania, usuwanie).
