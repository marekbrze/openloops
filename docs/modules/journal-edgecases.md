# Journal — Edge Cases

*Audyt stres-testowy z 2026-08-27 (proto-edgecases, commit `e959763`), po fazie **proto-harden** tego samego dnia.*
*Statusy: ✅ zaimplementowane (+ miejsce), ⏸️ świadomie odroczone (powód), ✔︎ zweryfikowane jako nie-problem.*

## Coverage (po harden)

- **Spec captured na staracie**: 6 pozycji z `docs/modules/journal.md` — wszystkie 6 obsłużonych już w lofi.
- **Nowe luki z audytu**: 9 (+1 dziedziczona nie-luka) → **7 zamkniętych**, **2 odroczonych świadomie**.
- **Severity**: 🔴 1 · 🟡 3 · 🟢 5 → wszystkie 🔴 i 🟡 zamknięte.

## Inventory

| # | Severity | Category | Edge case | Status | Gdzie / powód |
|---|----------|----------|-----------|--------|---------------|
| 1 | 🔴 | Cross-module / lifecycle | Ghost-wpis przy odhaczeniu akcji innego dnia niż odhaczenie | ✅ | Czyszczenie po indeksie `actionId` niezależnie od daty (`clearWinEntries`) — `repositories/index.ts:166-170`, wołane z `toggleDone` i `remove`; smoke E2E: wstrzyknięty ghost + toggle ± ⇒ 0 rekordów |
| 2 | 🟡 | Errors | Porażka odczytu mid-session = wieczny szkielet / biel | ✅ | Sentinel `READ_ERROR` w liveQuery (`use-journal.ts:33-45`) → karta z rolą `alert` i retry-tokenem (`journal-read-error.tsx`, `journal-screen.tsx:76-78`) |
| 3 | 🟡 | State transitions | Rekord o nieznanym `kind` wywala render (TypeError na ikonie) | ✅ | `Partial<Record>` + fallback „Wpis” z neutralną ikoną (`day-card.tsx:26-32,69`); mini-liczniki dnia liczą wyłącznie znane rodzaje; story `AnomalousKindSurvives` |
| 4 | 🟡 | A11y / Action outcomes | Zmiany bilansu nieme dla SR | ✅ | sr-only `role="status"` z konstrukcją bezodmienną „Małe zwycięstwa: N.” (`week-balance.tsx:20-23`) |
| 5 | 🟢 | Loading & async | Błysk szkieletu przy zmianie tygodnia | ✅ | Stan dziennika trzymany między odpowiedziami liveQuery — szkielet tylko przy pierwszym renderze (`use-journal.ts:53-66`) |
| 6 | 🟢 | Data states | Kotwica tygodnia niestyczna po północy w otwartej sesji | ✅ | Resync na `visibilitychange`/`focus`, ale tylko gdy użytkownik nie nawigował celowo (`manualNavRef`, `journal-screen.tsx:26-41`) |
| 7 | 🟢 | Navigation | Brak skrótów ← / → z klawiatury | ⏸️ | Opcjonalne przed testami userów; globalny listener przechwytujący strzałki grozi kolizją z dnd-kit i checkboxami — decyzja po testach |
| 8 | 🟢 | Data states | Niełamliwy token słabiej łamany niż chipy workbench | ✅ | `[overflow-wrap:anywhere]` + `title=` z pełną treścią (`day-card.tsx:86-89`) |
| 9 | 🟢 | Prototype-specific | Brak synchronizacji międzykartami przeglądarki | ⏸️ | Single-user single-tab zgodnie z założeniem produktu; most Dexie↔storage-events dopiero gdy testy pokażą potrzebę |
| 10 | 🟢 | Navigation | Deep-link/hash tygodnia | ✔︎ | Dziedziczona decyzja aplikacyjna (workbench-edgecases #10) — nie nowa luka |

**Kategorie sprawdzone bez uwag**: Forms & input ✔︎, Validation ✔︎, Destructive actions ✔︎ (read-only per ADR-0013), Empty states ✔︎, Loading initial ✔︎, Boundary values ✔︎, Unicode/RTL/emoji ✔︎, Offline ✔︎, Referenced-item-deleted ✔︎.

## Priority list (historia wykonania)

1. ~~Ghost-wpis (🔴)~~ → naprawiony w data-layer, dowód E2E w smoke.
2. ~~Powierzchnia błędu odczytu~~ → karta alert+retry.
3. ~~Ogłaszanie SR~~ → bezodmienny status.
4. Fallback nieznanego kind-a · anti-błysk · resync północy · anywhere/title → done. Skróty klawiaturowe i multi-tab odroczone z powodami.

## Hand-off status

proto-harden zamknął cały obowiązkowy zakres 2026-08-27 (ADR-0019). Kolejny baseline da re-run proto-edgecases; warstwa wizualna: proto-brand → proto-design → proto-polish.
