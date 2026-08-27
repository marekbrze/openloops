# Workbench — Edge Cases

*Audyt stres-testowy z 2026-08-27 (proto-edgecases) nad lo-fi z commita `e25c86d`. Diagnoza, nie decyzje — każdą „sugerowaną zachowanie” potwierdza/obala proto-harden.*

## Coverage

- **Spec already captured** (`docs/modules/workbench.md` → Edge Cases): pierwsze uruchomienie, brak akcji mój-ruch, progres pełny przy otwartym wątku, domknięcie z niezakończonymi akcjami, usunięcie/domknięcie zaznaczonego wątku, cel przy DnD, data dopytania przy done, pusty tytuł blokuje Enter.
- **Already handled in code**: brak bara/etykiety stanu (`workbench-ui.ts:14-24`), hint „Wątek bez kroków" (`action-panel.tsx:118-121`), hint „rozpisz kroki…" na karcie (`loop-card.tsx:79-81`), cel poza SortableContext (`action-panel.tsx:80-88`), overdue tylko dla undone (`action-row.tsx:22`, `workbench-ui.ts:36-38`), inline walidacja tytułu z `role=alert` (`add-loop-form.tsx:31-34`), ochrona przed wykasowaniem treści do pustka w klik-to-edit (`editable-text.tsx:44-50`), auto-fallback panelu po **usunięciu** zaznaczonego wątku (`use-workbench.ts:26` → `undefined`), First-run lewej kolumny z focusem i podpowiedzią (`loop-list-column.tsx:70,156-162`).
- **New gaps found**: 15
- **By severity**: 🔴 3 · 🟡 5 · 🟢 7

## Inventory

| # | Severity | Category | Edge case | Behavior today | Suggested behavior | Where |
|---|----------|----------|-----------|----------------|--------------------|-------|
| 1 | 🔴 | State transitions | Zaznaczony wątek zostaje **domknięty** — prawy panel dalej go renderuje jako edytowalny | `useLoop` pobiera wątek bez filtra statusu; po `Close Loop` panel pokazuje zamknięty wątek z działającymi checkboxami i CTA „Domknij" (drugi raz). Sprzeczne ze specem: „zaznaczenie czyści się do placeholda" | Panel renduje placeholder gdy `loop.status !== 'open'`; selection czyści się po domknięciu | `use-workbench.ts:26`, `action-panel.tsx:47` |
| 2 | 🔴 | Errors / Storage | Otwarcie IndexedDB pada (Safari private mode, zakaz storage) | `ensureScenarioBootstrapped().finally(setReady(true))` — ready=true mimo błędu; kwerendy wiecznie `undefined`; lewa kolumna utyka na „Ładowanie…", zero komunikatu | Stan błędu bootstrapu + ekran/banner „Przeglądarka blokuje lokalną bazę — aplikacja wymaga IndexedDB” z instrukcją retry po odmowie zgody | `App.tsx:20-27`, `loop-list-column.tsx:75` |
| 3 | 🔴 | Action outcomes | Wszystkie mutacje odpalane jako `void repo.x()` — odrzucony Promise znika w konsoli (20 call-site'ów) | Użytkownik klika, nic się nie dzieje, brak śladu w UI; percepcja „aplikacja nie zapisuje” | Wspólny wrapper mutacji z `.catch` → nieinwazyjny banner/toast „Nie udało się zapisać” + opcja ponowienia; punkty-zawołania przez wrapper | np. `action-row.tsx:38`, `loop-list-column.tsx:87-95`, `editable-text.tsx:19-22` |
| 4 | 🟡 | Forms | Dwuklik/Enter ×2 w Add Loop podczas trwającego `await` duplikuje wątki | Submit nie ma flagi busy; drugie Enter wchodzi przed wyczyszczeniem stanu | Disable przycisku + guard `submitting` na czas await; analogicznie w ActionAddForm | `add-loop-form.tsx:29-46`, `action-add-form.tsx:13-23` |
| 5 | 🟡 | Action outcomes | Po potwierdzeniu domknięcia nic nie potwierdza zapisu (moment nagrody urywa się) | Modal znika, karta spada do zwiniętej sekcji bez słowa; spec priority area chce nazwanego przepływu do dziennika | Toast/link „Domknięto · zobacz wpis w Dzienniku” (klik przełącza zakładkę); zasila też Discoverability dziennika | `close-loop-modal.tsx:40-47`, `App.tsx` (brak mechanizmu toastów) |
| 6 | 🟡 | Data states | Długi niełamliwy token w tagu/tytule (URL, „superkalifragilistyczny…”) rozwala szerokość karty/chipa | Chip nie ma `break-words`; flex-wrap pomaga tylko między chipami; pojedynczy token przewiesza layout | `break-all`/`min-w-0` na chipach i tytułach kart; truncation z `title=` na overflow | `tag-editor.tsx:47-60` |
| 7 | 🟡 | Cross-module | Wyścig tworzenia tagu o tej samej nazwie: unique index `&name` rzuca ConstraintError w `findOrCreate` | Drugie równoległe `findOrCreate('ux')` endzie rejectionem (połamany łańcuch u callerów) | Catch ConstraintError → re-read istniejącego tagu; plus wrappera z #3 | `repositories/index.ts:172-181` |
| 8 | 🟡 | Navigation | Pierwszy-run prawego panelu pokazuje zwykłe „Wybierz wątek…” a spec obiecuje wariant „nazwij pierwszy wątek…” | Jedna statyczna treść placeholdera w obu przypadkach | Wariant copy gdy lista otwarta pusta && sekcja zamknięta pusta (props/pochodna z kolumny) | `action-panel.tsx:110-119` |
| 9 | 🟢 | Loading & async | Initial load bez szkieletów | Tekst „Ładowanie…” / nagły pop-in listy | Skeleton kart o zbliżonym rytmie (3 rzędy) — niski priorytet, lo-fi czytelny | `loop-list-column.tsx:74-76` |
| 10 | 🟢 | Navigation | Back button / deep-link / refresh mid-flow nie mają reprezentacji w URL | Stan routingu w pamięci komponentu (tabs + selekcja) | Świadoma decyzja lo-fi; jeśli testy userów wskażą potrzebę — hash routing (`#journal`, `#loop=id`) | `App.tsx:12-17` |
| 11 | 🟢 | Errors | Draft w klik-to-edit ginie przy refreshu bez ostrzeżenia | Edycja nietrwała do commit-on-blur; F5 kasuje draft | Przyjąć (autosave kultura aplikacji) lub beforeunload-gate tylko gdy `editing` — decyzja harden | `editable-text.tsx:14-16` |
| 12 | 🟢 | A11y | dnd-kit ogłasza drag&drop po angielsku (wbudowane announcementy sensora) | EN komunikaty SR w PL UI | `screenReaderInstructions`/`announcements` PL w konfiguracji DndContext | `loop-list-column.tsx:54-57`, `action-panel.tsx:42-45` |
| 13 | 🟢 | Forms | Mikro-wyścig szybkiego double-toggle checkboxa (dwie operacje czytają ten sam snapshot `done`) | Rezultat transakcji deterministyczny per wywołanie, ale finalny stan może odbiegać od intencji przy Extremely szybkim klikaniu | Nieistotne dla realnych testów; ewent. optimistic-disable na durację toggleDone | `action-row.tsx:37-40` |
| 14 | 🟢 | Data states | Brak limitów długości pól (tytuł/cel/akcja po kilkanaście tysięcy znaków) | Layout znosi przez wrap; performance lokalna OK | Miękki limit (np. 500 znaków) z licznikiem albo świadome brak-limitu decision | `editable-text.tsx`, pola formularzy |
| 15 | 🟢 | Prototype-specific | Offline: brak zapytań sieciowych w runtime (fonty/sVG bundlowane lokalnie) | Działa offline ✓ — **no issues found** w tej kategorii | — | build output (assets lokalne) |

Kategorie sprawdzone i czyste poza wyżej wymienionymi: **boundary values** (sortOrder min−1/max+1 stabilne przy pustej tabeli), **invalid transitions** (status zmieniają wyłącznie dedykowane akcje UI), **stale data** (żywe kwerendy Dexie eliminują klasę problemu), **referenced item deleted** (akcje kasowane kaskadowo wraz z wątkiem, snapy DayEntry celowo pozostają — zgodnie z ACTIONS.md).

## Priority list

1. **#1 Ghost-panel zamkniętego wątku** — najmniejszy diff, największa korektność: jedna linia warunku + czyszczenie selekcji; naprawia naruszenie własnej specyfikacji momentu domknięcia.
2. **#2 Ekran błędu bootstrapu IndexedDB** — dziś jedyna droga do totalnej ciszy UI; local-first żyje i umiera z tą powierzchnią.
3. **#3 Wrapper mutacji z error-bannereem** — fundament pod #7 i przyszły moduł tags; eliminuje całą rodzinę „kliknąłem i nic".
4. **#4 Guardy double-submit** — tanie, chronią dane demo przed duplikatami podczas sesji testowych.
5. **#5 Toast „wpis trafił do dziennika"** — domyka priority area z MODULES.md (przepływ informacji ma być czuty).
6. Dalej wg tabeli (#6, #8, potem 🟢).

## Hand-off to proto-harden

Zaimplementować w pierwszej kolejności:
- **#1** — panel nie edytuje zamkniętych/porzuconych wątków (+ sprzątnięcie selekcji po Close),
- **#2** — widoczny stan awarii storage z retry,
- **#3** — centralne łapanie odrzuconych mutacji z komunikatem dla użytkownika,
- **#4**, **#5**, **#6**, **#7**, **#8** według kolejności z priority list.
