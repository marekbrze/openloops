# openloops

## Core Idea

Local-first system do prowadzenia **otwartych wątków** (open loops) w pracy: każdy wątek ma rozpisaną listę działań zakończoną krótkim celem-definition-of-done, a aplikacja loguje dzień po dniu wykonane akcje i domknięte wątki — tak, żebyś widział, ile realnie zrobiłeś i czuł małe zwycięstwa napędzające działanie.

## User Problems

- **Rozproszenie otwartych tematów**: otwarte wątki żyją w mailach, chatach, notatkach i w głowie. Nic nie pilnuje całości, część tematów ginie lub wraca niepotrzebnie. Dziś: sczytywanie z kilku miejsc albo trzymanie wszystkiego w pamięci.
- **Mieszanka „mój ruch" i „czekam na kogoś"**: lista spraw nie rozróżnia tego, na czym możesz działasz teraz, od tego, na co jesteś zablokowany na innych. Skutek: fałszywe poczucie zastoju — progress bar staje w miejscu, choć Twoja część jest zrobiona.
- **Brak jasnej linii mety**: wiele wątków nie ma zdefiniowanego „co znaczy gotowe". Tematy wiszą tygodniami, bo nikt nie wskazał momentu, w którym można je domknąć.
- **Niewidoczny postęp**: nie ma miejsca, które pokazuje „ile dziś zrobiłem". Brak tej pętli odbiera poczucie skończonych spraw i momentum do działania. Dziś: nic tego nie liczy — bilans dnia jest odczuwany, nie wiedziony.

## Target Users

Pojedynczy użytkownik — Ty: osoba pracująca kreatywno/projektowo (UX), prowadząca jednocześnie wiele luźnych wątków roboczych o różnym tempie. Cenisz narzędzia local-first (dane u siebie, zero konta, IndexedDB/Dexie — jak dopadone i dopawrite), szybki zapis myśli i widoczność postępu ponad bogate funkcje kooperacyjne.

## Key Actions

1. **Dodaj wątek** — nazwij otwarty temat i zapisz mu cel („po czym wiem, że gotowe").
2. **Priorytetyzuj listę** — układaj wątki ręcznie (drag & drop); to jest twoja mapa dnia.
3. **Rozpisz akcje** — dla zaznaczonego wątku dodaj działania, oznacz każdy jako „mój ruch" albo „czekam na kogoś" i ułóż je ręcznie (drag & drop) w kolejności wykonania.
4. **Odhaczaj i śledź progres** — zaznaczaj skończone akcje; progres bar wątku rośnie na akcjach typu „mój ruch".
5. **Domknij wątek** — gdy cel osiągnięty, kliknij „domknij": wątek zniknie z otwartej listy i wpisze się do dziennika.
6. **Przejrzyj dziennik** — zobacz per dzień skończone akcje i domknięte wątki; Twój bilans zwycięstw.

## Happy Path

Otwierasz aplikację → lądujesz na ekranie **Teraz** (widok startowy od 2026-08-27, ADR-0020): dzisiejsza data z dniem tygodnia i żywym zegarem nad kolejką wybranych zadań → klikasz **„Wybierz zadania"** i w modalu przełącznikiem „Teraz" wybierasz akcje do zrobienia — kolejka pod spodem rośnie na żywo (albo robisz to prosto z panelu wątku w workbench) → zamykasz modal, układasz kolejność dnia drag & drop → robisz pierwszą pozycję i odhaczasz ją (małe zwycięstwo do dziennika) → zdejmujesz zrobione, a resztę planu dowozisz przy okazji → w tle priorytetyzujesz wątki i dopisujesz kroki w workbench, aż realizacja celu staje się faktem → klikasz „domknij wątek” → zaglądasz do dziennika: wpis tego dnia mówi Ci jasno, ile udało Ci się zrobić i domknąć.

## Decyzje obrane (potwierdzone)

- „Czekam na kogoś" istnieje na **obu poziomach**: każda akcja ma typ (mój ruch / czekam na kogoś), a wątek zbiorczo pokazuje, że jest zablokowany na innych.
- **Kolejność akcji jest ręczna** (drag & drop) — odzwierciedla plan wykonania; cel zawsze pozostaje ostatnim elementem listy.
- **Domknięcie jest ręczne** — Ty oceniasz osiągnięcie celu; odhaczenie wszystkich akcji nie jest warunkiem.
- **Progres bar liczy tylko akcje „mój ruch"** — bar nie staje w miejscu, gdy czekasz na innych.
- **Dziennik to osobny widok** przełączany z paska modułów, z nawigacją po tygodniach i bilansem całego tygodnia (dzień po dniu w środku).
- **Ekran Teraz jest widokiem startowym** (2026-08-27, ADR-0020): data/dzień/godzina + ręczna kolejka (ADR-0021); dobór zadań przełącznikiem „Teraz" z modalu Zadania lub workbench (ADR-0022, ADR-0024), doklejanie na koniec kolejki (ADR-0023).
- **Storage**: localStorage + Dexie (IndexedDB), wzorzec zgodny z dopadone/dopawrite; single-user, bez autoryzacji i backendu.

## Decyzje z deepen (2026-08-27)

- **Stany wątku**: open / closed / abandoned. Porzucenie ≠ zwycięstwo — dziennik odróżnia „domknąłem" od „odpuściłem". Reopen i twarde usunięcie dostępne.
- **Zwycięstwa**: skończona akcja = małe zwycięstwo, domknięty wątek = większe zwycięstwo. Odhaczenie akcji usuwa jej wpis — bilans dnia zawsze pokazuje stan realny.
- **Data dopytania**: opcjonalna data na akcjach „czekam na kogoś"; po terminie znacznik przeterminowania, bez powiadomień.

## Open Questions

- ~~**Tagi**: swobodne wpisywane czy zarządzana lista z edycją globalną (rename/remove)?~~ *(rozstrzygnięte w proto-detail 2026-08-27, następnie **wycofane** decyzją użytkownika 2026-08-27: moduł tags usunięty — workbench nie operuje na tagach; patrz MODULES.md)*
- ~~Jak dokładnie wygląda moment domknięcia w UI~~ *(rozstrzygnięte w proto-detail 2026-08-27: przycisk „Domknij” w nagłówku panelu akcji + modal celebracyjny „Cel osiągnięty”; ADR-0001)*
- Pozostałe decyzje UX workbench spisane w `docs/modules/workbench.md` (ADR-0002…0010).
