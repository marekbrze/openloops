# Now (Teraz) — Edge Cases

*Audyt stres-testowy z 2026-08-27 (proto-edgecases, commit `cd69836`), po fazie **proto-harden** tego samego dnia.*
*Statusy: ✅ zaimplementowane (+ miejsce), ⏸️ świadomie odroczone (powód), ✔︎ zweryfikowane jako nie-problem.*

## Coverage (po harden)

- **Spec captured na starcie**: 8 pozycji z `docs/modules/now.md` — wszystkie 8 obsłużonych już w lofi.
- **Nowe luki z audytu**: 7 → **5 zamkniętych**, **2 odroczonych świadomie**.
- **Severity**: 🔴 0 · 🟡 2 · 🟢 5 → wszystkie 🟡 zamknięte.

## Inventory

| # | Severity | Category | Edge case | Status | Gdzie / powód |
|---|----------|----------|-----------|--------|---------------|
| 1 | 🟡 | Data states / race | Wyścig stanu pustego: `rows` czytelne, `openLoopCount` jeszcze nie → fałszywy wariant „świeży świat" mrugał użytkownikowi z wątkami | ✅ | EmptyQueue renderowana dopiero na rozstrzygniętym liczniku (szkielet do tego czasu) — `now-screen.tsx:72-81` |
| 2 | 🟡 | Action outcomes | Drag-end po zmianie wierszy: `findIndex` = −1 → `arrayMove` zapisywał fałszywy porządek dnia | ✅ | Early-return na −1 przed `nowRepo.reorder` — `now-screen.tsx:97-99` |
| 3 | 🟢 | Errors | Odczyty pomocnicze (`usePickedActionIds`, `useOpenLoopCount`) bez obsługi porażki — wiecznie disabled / zgadywany stan pusty | ✅ | Sentinel `READ_ERROR` + wspólny retry-token w obu hookach (`use-now.ts:100-131`); porażka licznika w stanie pustym pokazuje kartę retry (`now-screen.tsx:76-78`); story `Now/NowReadError` |
| 4 | 🟢 | Data states | Truncation bez pełnej treści (etykieta, tytuł wątku) | ✅ | `title=` na obu uciętych elementach — `now-screen.tsx:182,186` |
| 5 | 🟢 | Boundary values | Numeracja ≥ 100 nachodziła na checkbox (`w-5`) | ✅ | `min-w-5` zamiast stałej szerokości — `now-screen.tsx:169` |
| 6 | 🟢 | Prototype-specific | LiveQuery modalu i członkostwa żywe przy zamkniętym dialogu (zbyteczne kwerendy) | ⏸️ | Gate subskrypcji flagą `open` = skeleton-flash przy każdym otwarciu modalu; koszt znikomy w skali prototypu — wraca w proto-polish, jeśli testy pokażą |
| 7 | ⏸️ | Action outcomes | Brak in-flight disable przy toggle/X/reorder | ⏸️ | Dziedziczona decyzja workbench #13 — optimistic-disable gdy testy userów pokażą problem |
| 8 | ⏸️ | State transitions | Nowy dzień, wczorajsza kolejka (brak rolowania dnia) | ⏸️ | Świadome wg ADR-0023 („zrobione zostają", zdjęcie = decyzja użytkownika); wrócić po testach userów |

**Kategorie sprawdzone bez uwag**: Empty states ✔, Loading initial ✔, Errors–read ✔, Errors–write ✔ (guard), Forms & input ✔ (moduł bez formularzy), Validation ✔ (n/d), Destructive confirm ✔ (zdjęcie odwracalne — źródło nietknięte), Undo ✔ (n/d), Success feedback ✔, State transitions ✔ (kaskady ADR-0021, reopen bez odtwarzania), Cross-module deleted-source ✔ (join-filtr), Storage write/read ✔, Offline ✔, Navigation/back/deep-link ✔ (dziedziczone ⏸️ #10 workbench), Unicode/RTL/emoji ✔, Północ/uśpienie ✔.

## Priority list (historia wykonania)

1. ~~Wyścig stanu pustego~~ → gate na rozstrzygniętym liczniku.
2. ~~Guarda −1 w drag-endzie~~ → early-return.
3. ~~Odczyty pomocnicze~~ → sentinele + wspólny retry; karta błędu w stanie pustym.
4. 🟢 `title=` · min-w numeracji → done. Gate liveQuery (6) odroczony z powodem.
5. Odrocone świadomie: #7 (in-flight), #8 (rolowanie dnia).

## Hand-off status

proto-harden zamknął cały obowiązkowy zakres 2026-08-27 (ADR-0027). Kolejny baseline da re-run proto-edgecases; warstwa wizualna: proto-brand → proto-design → proto-polish.
