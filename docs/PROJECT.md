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
2. **Priorytetyzuj listę** — układaj wątki ręcznie (drag & drop), dobieraj tagi; to jest twoja mapa dnia.
3. **Rozpisz akcje** — dla zaznaczonego wątku dodaj działania i oznacz każdy jako „mój ruch" albo „czekam na kogoś".
4. **Odhaczaj i śledź progres** — zaznaczaj skończone akcje; progres bar wątku rośnie na akcjach typu „mój ruch".
5. **Domknij wątek** — gdy cel osiągnięty, kliknij „domknij": wątek zniknie z otwartej listy i wpisze się do dziennika.
6. **Przejrzyj dziennik** — zobacz per dzień skończone akcje i domknięte wątki; Twój bilans zwycięstw.

## Happy Path

Otwierasz aplikację → widzisz posortowaną priorytetowo listę otwartych wątków → zaznaczasz topowy wątek → po prawej widzisz jego akcje → robisz pierwszy „mój ruch" i odhaczasz go (progres bar rośnie) → na punktach „czekam na kogoś" zostawiasz bufor/follow-up → w kolejnych dniach wracasz, aż realizacja celu staje się faktem → klikasz „domknij wątek" → zaglądasz do dziennika: wpis tego dnia mówi Ci jasno, ile udało Ci się zrobić i domknąć.

## Decyzje obrane (potwierdzone)

- „Czekam na kogoś" istnieje na **obu poziomach**: każda akcja ma typ (mój ruch / czekam na kogoś), a wątek zbiorczo pokazuje, że jest zablokowany na innych.
- **Domknięcie jest ręczne** — Ty oceniasz osiągnięcie celu; odhaczenie wszystkich akcji nie jest warunkiem.
- **Progres bar liczy tylko akcje „mój ruch"** — bar nie staje w miejscu, gdy czekasz na innych.
- **Dziennik to osobny widok** przełączany z głównego ekranu, z pełną historią po datach.
- **Storage**: localStorage + Dexie (IndexedDB), wzorzec zgodny z dopadone/dopawrite; single-user, bez autoryzacji i backendu.

## Open Questions

- Czy oprócz domknięcia potrzebny jest status **porzucony/wstrzymany** (wątek zdjęty z listy bez zwycięstwa)?
- **Terminy/daty** na wątkach i akcjach — na start brak; czy dodać później (np. follow-up date dla „czekam na kogoś")?
- **Tagi**: swobodne wpisywane czy zarządzana lista z edycją globalną (rename/remove)?
- Dziennik: czy potrzebna **statystyka dłuższego horyzontu** (np. trend tygodnia), czy wystarczy dzień po dniu?
