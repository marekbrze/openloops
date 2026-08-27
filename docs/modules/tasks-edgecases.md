# Tasks (Zadania) — Edge Cases

*Audyt stres-testowy z 2026-08-27 (proto-edgecases, commit `cd69836`), po fazie **proto-harden** tego samego dnia.*
*Statusy: ✅ zaimplementowane (+ miejsce), ⏸️ świadomie odroczone (powód), ✔︎ zweryfikowane jako nie-problem.*

## Coverage (po harden)

- **Spec captured na starcie**: 8 pozycji z `docs/modules/tasks.md` — wszystkie 8 obsłużonych już w lofi.
- **Nowe luki z audytu**: 6 → **5 zamkniętych**, **1 odroczona świadomie** (wspólna z now #6).
- **Severity**: 🔴 0 · 🟡 1 · 🟢 5 → wszystkie 🟡 zamknięte.

## Inventory

| # | Severity | Category | Edge case | Status | Gdzie / powód |
|---|----------|----------|-----------|--------|---------------|
| 1 | 🟡 | Errors / cross-module | Toast porażki mutacji niewidoczny nad modalem: `notify` renderował w rootcie App POD top layerem `showModal()` — nieudany pick/unpick milczał do zamknięcia | ✅ | Systemowa naprawa: stack `AppNotices` w top layer przez `popover="manual"` + `showPopover()` (`app-notices.tsx:34-47`); niemodalny (bez blokady strony i kradzieży Esc), z degradacją do fixed div; leczy też ten sam niemy błąd w modalu domknięcia wątku (workbench) |
| 2 | 🟢 | Data states / race | Licznik pokazywał „0 do zrobienia" dopóki katalog się ładuje | ✅ | Licznik renderowany dopiero z danymi (`task-picker-modal.tsx:55`); X przejmuje `ml-auto` dla stabilnego układu |
| 3 | 🟢 | Data states | Tytuł wątku w nagłówku grupy bez truncate — długi tytuł spychał bilans `done/total` | ✅ | `min-w-0 truncate` + `title=` z pełnym tytułem — `task-picker-modal.tsx:117-121` |
| 4 | 🟢 | Data states | Etykieta zadania ucięta bez dostępu do całości | ✅ | `title={action.label}` — `task-picker-modal.tsx:172` |
| 5 | 🟢 | Errors | Retry katalogu nie odgrzewał kwerendy członkostwa — „Spróbuj ponownie" bywało bezsilne | ✅ | Wspólny retry-token w `usePickedActionIds(readRetry)` (`task-picker-modal.tsx:31`); porażka członkostwa pokazuje kartę retry jak porażka katalogu (`task-picker-modal.tsx:66`); story `Tasks/CatalogueReadError`; rippling: `action-panel.tsx:116` (praca na `instanceof Set`) |
| 6 | 🟢 | Prototype-specific | LiveQuery modala żywe przy zamkniętym dialogu | ⏸️ | Jak now #6 — gate = skeleton-flash przy każdym otwarciu; kosmetyka na proto-polish |
| 7 | ⏸️ | Action outcomes | Podwójne kliknięcie przełącznika w locie (dane bezpieczne — klucz deterministyczny) | ⏸️ | Dziedziczona decyzja workbench #13 / now #7 |

**Kategorie sprawdzone bez uwag**: Empty states ✔ (trzy warianty), Errors–read/write ✔ (sentinel + guard), Forms & input ✔ (brak formularzy — ADR-0022), Validation ✔ (n/d), Destructive ✔ (niczego nie niszczy), Success feedback ✔ (natychmiastowy efekt + liveQuery), State transitions ✔ (done disabled, usunięcia przez liveQuery), Loading initial ✔, Navigation ✔ (Esc/tło/X, focus wraca), Deep-link ✔ (dziedziczone ⏸️), Cross-module ✔ (kaskady ADR-0021), Storage ✔, Offline ✔, Unicode/RTL/emoji ✔, Boundary ✔ (`followUpDate === dziś` nie jest po terminie).

## Priority list (historia wykonania)

1. ~~Toast nad modalem~~ → systemowy top-layer popover w `AppNotices`.
2. ~~Licznik przy szkielecie~~ → render z danymi.
3. ~~Truncation nagłówka grupy + `title=`~~ → done.
4. ~~Retry odgrzewa membership~~ → wspólny token; ripple do workbench.
5. Gate liveQuery (6) i in-flight disable (7) odroczone z powodami.

## Hand-off status

proto-harden zamknął cały obowiązkowy zakres 2026-08-27 (ADR-0028, wraz z decyzją systemową o toastach w top layer). Kolejny baseline da re-run proto-edgecases; warstwa wizualna: proto-brand → proto-design → proto-polish.
