# Workbench — Edge Cases

*Audyt stres-testowy z 2026-08-27 (proto-edgecases, commit `16567a6`), po fazie **proto-harden** tego samego dnia.*
*Statusy: ✅ zaimplementowane (+ miejsce), ⏸️ świadomie odroczone (powód), ✔︎ zweryfikowane jako nie-problem, ⛔️ nieaktualne (funkcja usunięta z kodu).*

## Coverage (po harden)

- **Spec captured na starcie**: 8 pozycji — 6 obsłużonych już w lofi, 2 częściowo (first-run panelu, moment nagrody) → doprawione w harden.
- **Nowe luki z audytu**: 15 → **10 zamkniętych**, **4 odroczonych świadomie**, 1 potwierdzona jako nie-luka.
- **Severity**: 🔴 3 · 🟡 5 · 🟢 7 → wszystkie 🔴 i 🟡 zamknięte; 🟢 wg tabeli poniżej.

## Inventory

| # | Severity | Category | Edge case | Status | Gdzie / powód |
|---|----------|----------|-----------|--------|---------------|
| 1 | 🔴 | State transitions | Ghost-panel zamkniętego wątku | ✅ | Guard statusu w warunku renderu — domknięcie/porzucenie zaznaczonego wątku zawsze schodzi do placeholda `action-panel.tsx:52`; sprawdzony smoke #2 |
| 2 | 🔴 | Errors / Storage | Otwarcie IndexedDB pada | ✅ | Bootstrap `.catch` + pełnoekranowy alert z „Spróbuj ponownie” `App.tsx:36-58` |
| 3 | 🔴 | Action outcomes | Nieme odrzucenia mutacji (`void repo.x()`) | ✅ | Wspólny wrapper `shared/lib/mutations.ts` (guard → baner błędu); wszystkie call-site'y owinięte |
| 4 | 🟡 | Forms | Podwójny Enter duplikuje rekordy | ✅ | Flaga `busy` + disable; akcja czyści pole tylko po sukcesie (`add-loop-form.tsx`, `action-add-form.tsx`) |
| 5 | 🟡 | Action outcomes | Po domknięciu brak feedbacku | ✅ | Toast „Domknięto… czeka w Dzienniku” z przyciskiem przełączającym widok (`action-panel.tsx` onConfirm + `app-notices.tsx`); decyzja użytkownika 2026-08-27 |
| 6 | 🟡 | Data states | Niełamliwy token rozwala kartę/chip | ⛔️ | Dotyczyło chipów tagów (`tag-editor.tsx`) — **nieaktualne od 2026-08-27**: moduł tags usunięty |
| 7 | 🟡 | Cross-module | Wyścig findOrCreate na unique indeksie | ⛔️ | Dotyczyło tworzenia tagów — **nieaktualne od 2026-08-27**: moduł tags usunięty |
| 8 | 🟡 | Navigation | First-run copy prawego panelu | ✅ | Prop `firstRun` liczy go WorkbenchScreen z obu kwerend (`workbench-screen.tsx`); warianty copy w `PanelPlaceholder` |
| 9 | 🟢 | Loading & async | Initial load bez szkieletu | ✅ | `SkeletonCards` o rytmie karty w lewej kolumnie `loop-list-column.tsx` |
| 10 | 🟢 | Navigation | Back button / deep-link / URL-brak | ⏸️ | Lo-fi decyzja: routing stanem komponentu; hash-routing rozważymy, jeśli testy userów pokażą potrzebę |
| 11 | 🟢 | Errors | Draft edycji ginie przy F5 | ⏸️ | Decyzja użytkownika: kultura autosave (click-to-edit commituje na blur), zero fałszywych blokad |
| 12 | 🟢 | A11y | dnd-kit SR mówi po angielsku | ✅ | `plDndAccessibility` w obu DndContext (`pl-dnd.tsx`) — instrukcje + announcementy PL |
| 13 | 🟢 | Forms | Mikro-wyścig double-toggle checkboxa | ⏸️ | Nieistotny dla realnych sesji testowych; ewentualny optimistic-disable przy potrzebie |
| 14 | 🟢 | Data states | Brak limitów długości pól | ⏸️ | Świadomy brak (layout znosi przez wrap); hard-limit rozważy proto-design/polish |
| 15 | 🟢 | Prototype-specific | Offline behavior | ✔︎ | Runtime bez zapytań sieciowych (fonty/ikony bundlowane) — działa offline |

Kategorie sprawdzone: boundary values ✓, invalid transitions ✓ (status zmieniają wyłącznie dedykowane akcje), stale data ✓ (żywe kwerendy Dexie), referenced-item-deleted ✓ (kaskada akcji, snapy DayEntry celowo pozostają).

## Priority list (historia wykonania)

1. ~~Ghost-panel zamkniętego wątku~~ → naprawiony, smoke-verifiable.
2. ~~Ekran błędu IndexedDB~~ → pełnoekranowa powierzchnia z retry.
3. ~~Wrapper mutacji~~ → guard obejmuje wszystkie zapisy; formularze rozróżniają sukces/porażkę.
4. ~~Guardy double-submit~~ · 5. ~~Toast „wpis trafił do dziennika”~~ · 6–8 overflow/first-run/wyścig tagów → done.
9. Skeletony → done. Pozostałe odroczone z powodami w tabeli.

## Hand-off status

proto-harden zamknął cały priority list 2026-08-27. Kolejny baseline da re-run `proto-edgecases`; wizualna warstwa: `proto-brand → proto-design → proto-polish`.
