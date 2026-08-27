# Domain Glossary

Terms and concepts specific to this project. Used across all project skills to maintain a consistent language.

| Term | Code Name | Definition | Avoid saying |
|------|-----------|------------|--------------|
| wątek / otwarty wątek | `Loop` | Jednostka pracy: otwarty temat roboczy z listą akcji i celem na końcu; ma ręczny priorytet i progres. Żyje na liście po lewej. | „task", „zadanie" (koliduje z akcją), „thread" (kolizja z nitką wykonania) |
| domknięcie wątku | `CloseLoop` | Ręczna decyzja użytkownika, że cel osiągnięty — kończy cykl życia wątku, wpisuje go do dziennika jako zwycięstwo dnia. | „usuń", „delete", „ukończ wszystkie zadania" |
| cel | `Goal` | Ostatni element listy akcji wątku: krótki opis stanu „po czym wiem, że gotowe". Kieruje pracę i warunkuje domknięcie. | „opis", „description", „definition of done" bez kontekstu UI |
| akcja | `Action` | Konkretny krok do podjęcia w ramach wątku; składowa progresu; ma typ właściciela. | „task", „todo" |
| mój ruch | `MyMove` | Typ akcji wymagający działania użytkownika — liczy się do progresu bar wątku. | „aktywne zadanie" |
| czekam na kogoś | `WaitingOn` | Typ akcji zablokowanej na osobie trzeciej — nie liczy się do progresu; wektoryzuje zbiorczy status wątku. | „blocked" (bez wskazania komu), „delegowane" |
| priorytet | `SortOrder` | Ręcznie ustawiana kolejność wątków na liście (drag & drop); to nie jest wyliczany score. | „priority score", „ważność" |
| kolejność akcji | `ActionSortOrder` | Ręcznie ustawiana kolejność działań w wątku (drag & drop) — plan wykonania. Cel jest zawsze przypięty jako ostatni element i nie podlega przeciąganiu poza koniec. | „kolejność automatyczna", „sortowanie alfabetyczne" |
| progres | `Progress` | Udział wykonanych akcji typu „mój ruch" względem wszystkich akcji tego typu w wątku; wizualizowany barem. | „postęp projektu" |
| dziennik | `DayLog` | Osobny widok: log per dzień — wykonane akcje i domknięte wątki; źródło poczucia zwycięstw. | „historia", „log systemowy" |
| wpis dziennika | `DayEntry` | Pojedynczy rekord zdarzenia (skończona akcja / domknięty wątek) przypisany do dnia i czasu. Odhaczenie akcji usuwa jej wpis. | „event" |
| zwycięstwo | `Win` | Jednostka bilansu motywacyjnego: skończona akcja = małe zwycięstwo, domknięty wątek = większe zwycięstwo. Porzucenie nie jest zwycięstwem. | „punkt", „score" |
| porzucony | `Abandoned` | Status wątku świadomie odpuszczonego (open → abandoned). Nie liczy się jako zwycięstwo; można przywrócić do otwartego. | „usunięty", „zakończony" |
| data dopytania | `FollowUpDate` | Opcjonalna data na akcji typu czekam na kogoś; po terminie widoczny znacznik przeterminowania. Bez powiadomień. | „deadline", „przypomnienie" |
| tygodniowy bilans | `WeekSummary` | Agregacja wpisów dziennika na tydzień z nawigacją ← / → i podglądem dzień po dniu. | „statystyki", „raporty" |
| ekran główny | `Workbench` | Podzielony ekran pracy: lista wątków po lewej + panel akcji z celem po prawej; jedyny pisarz wpisów zwycięstw. | „dashboard", „kokpit" |
