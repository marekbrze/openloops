# Journal — Edge Cases

*Audyt stres-testowy z 2026-08-27 (proto-edgecases), baseline przed proto-harden.*
*Statusy w ewidencji workbench stosowane dopiero po harden; tutaj: zachowanie dziś → sugerowane domyślne.*

## Coverage

- **Spec captured na starcie**: 6 pozycji z `docs/modules/journal.md` (pusty tydzień · tydzień przyszły · bieżący trwa · usunięte źródło · odhaczenie wstecz · stabilne sortowanie) — **wszystkie 6 zaimplementowane już w lofi** (bilans 0·0 z notką `week-balance.tsx:23`, nawigacja ograniczona dzisiaj `journal-screen.tsx:19`, snapshot-only bez deref źródła `day-card.tsx`, żywe liveQuery, tie-breaker po id `use-journal.ts:36-46`).
- **Nowe luki z audytu**: 9 (+1 dziedziczona decyzja nieodroczenia).
- **By severity**: 🔴 1 · 🟡 3 · 🟢 5.

## Inventory

| # | Severity | Category | Edge case | Behavior today | Suggested behavior | Where |
|---|----------|----------|-----------|----------------|--------------------|-------|
| 1 | 🔴 | Cross-module / lifecycle | **Wpis-ghost przy odhaczeniu innego dnia**: odhaczę akcję w poniedziałek, cofnę we wtorek → usuwany jest wpis `${actionId}:${dzis}` (wtorek), a poniedziałkowy zostaje. „Bilans zawsze realny" (istota produktu) kłamie | `toggleDone` i `remove` czyszczą wyłącznie wpis DZISIEJSZEJ daty | Usuwać po indeksie `actionId` niezależnie od dnia: `db.dayEntries.where('actionId').equals(id).delete()` — indeks istnieje w schemacie v1 | `src/modules/data-layer/repositories/index.ts:133` i `:152` (`clearCurrentWinEntry`) |
| 2 | 🟡 | Errors | Porażka odczytu mid-session nie ma ścieżki: błąd liveQuery = wieczny szkielet lub rzucony render (brak error boundary → biel) | `undefined` traktowany jak loading bez rozróżnienia porażki | Rozróżnić stan błędu od ładowania; komunikat przez istniejący kanał `AppNotices`/full-screen z retry — wzorzec z bootstrapu | `src/modules/journal/hooks/use-journal.ts:29`, `components/journal-screen.tsx:32,41` |
| 3 | 🟡 | State transitions | Rekord o nieznanym `kind` (ręczna edycja IndexedDB, literówka w scenariuszu dev) rzuca TypeError przy renderze wpisu → biel bez boundary | `KIND_META[entry.kind]` bez fallbacku | Wariant domyślny (neutralna ikona, etykieta „wpis”) zamiast wybuchu całej aplikacji | `src/modules/journal/components/day-card.tsx:68` |
| 4 | 🟡 | A11y / Action outcomes | Odhaczenie/domknięcie w workbench jest nieme dla SR patrzącego na Dziennik — bilans zmienia się bez ogłoszenia | `aria-live` tylko na nagłówku tygodnia | `aria-live="polite"` na wartościach bilansu albo sr-only announcer („3 małe zwycięstwa”) — paritet z PL announcementami dnd workbench | `src/modules/journal/components/week-balance.tsx:52` |
| 5 | 🟢 | Loading & async | Błysk szkieletu przy każdej zmianie tygodnia: między nawigacją a odpowiedzią liveQuery dane są chwilowo `undefined` | pumpa szkieletów przy każdym ←/→ | keep-previous-data albo opóźniony szkielet (~150 ms) — estetyka przejścia | `src/modules/journal/hooks/use-journal.ts:29` |
| 6 | 🟢 | Data states | Sesja otarta o północ: kotwica tygodnia niestyczna — strzałki/„Dziś” liczone ze starej daty aż do pierwszej interakcji (po kliknięciu samo się poprawia) | `useState(() => startOfWeek(new Date()))` raz przy montażu | Resync kotwicy przy `visibilitychange`/focus karty | `src/modules/journal/components/journal-screen.tsx:13` |
| 7 | 🟢 | Navigation | Brak skrótów klawiaturowych ← / → / T dla nawigacji tygodniami | wyłącznie klik przycisków | ArrowLeft/ArrowRight gdy fokus w obszarze widoku; opcjonalne — prototype-level nic nie blokuje | `src/modules/journal/components/journal-screen.tsx` |
| 8 | 🟢 | Data states | Niełamliwy token w snapshocie łamany słabiej niż chipy tagów workbench (`overflow-wrap:break-word` vs ich `anywhere`) | `break-words` na treści wpisu | Ujednolicić do `[overflow-wrap:anywhere]` + `title=` z pełną treścią jak w workbench | `src/modules/journal/components/day-card.tsx:81` |
| 9 | 🟢 | Prototype-specific | Brak synchronizacji międzykartami przeglądarki: dwie zakładki = dwa rozjechane bilanse do czasu re-renderu | liveQuery nasłuchuje tylko własnej karty | Świadome odroczenie (single-user single-tab); ewentualnie Dexie observable/storage bridge w data-layer później | nota infrastrukturalna: `src/modules/data-layer/db/db.ts` |
| 10 | 🟢 | Navigation | Deep-link/hash na konkretny tydzień nie istnieje (refresh wraca na bieżący) | routing stanem komponentu | ✔︎ **Nie-luka**: świadome odroczenie całej aplikacji (workbench-edgecases #10) — dziedziczę decyzję | `src/modules/journal/components/journal-screen.tsx` |

**Kategorie sprawdzone bez uwag**: Forms & input ✔︎ (moduł read-only — zero formularzy), Validation ✔︎ (brak inputów użytkownika), Destructive actions ✔︎ (brak — ADR-0013), Empty states ✔︎ (tydzień 0·0, dzień „Brak zwycięstw” — od startu), Loading initial ✔︎ (szkielety bilansu i dni), Boundary values ✔︎ (0/max/tabular-nums), Unicode/RTL/emoji ✔︎ (czysty path tekstowy React), Offline ✔︎ (zasoby bundlowane), Referenced-item-deleted ✔︎ (snapshot celowo samowystarczalny; reopen nie kasuje historii — decyzja deepen).

## Priority list

1. **Luka #1 (🔴)** — jedyna naruszająca obietnicę produktu: bilans dnia ma być zawsze realny, a ghost-wpis z poprzedniego dnia go fałszuje. Naprawa w `data-layer` (jedyna piszącą tabelę jest workbench, ale konsekwencją jest fałszywy dziennik) — dwie linie z indeksem `actionId`.
2. **#2 powierzchnia błędu odczytu** — bez niej moduł umiera ciszą/kwetą szkieletu.
3. **#4 ogłaszanie SR** — motywacyjny rdzeń aplikacji ma być słyszalny, nie tylko widoczny.
4. Dalej 🟢 wg kolejności tabeli (#3 fallback kind-a praktycznie wcześniej, bo to jeden case-guard).

## Hand-off to proto-harden

Zaimplementować po kolei: **#1 → #2 → #3 → #4**, potem tanie zielone (#8 jednym atrybutem, #6 resync visibility, #7 skróty klawiaturowe opcjonalne, #5 keep-previous). #9/#10 pozostają świadomie odroczone z powodami.
