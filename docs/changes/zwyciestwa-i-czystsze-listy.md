# Change: Zwycięstwa na liście wątków + lżejsze karty + przemeblowany panel akcji

## Type
Feature + UX refactor (bezpośrednie zmiany po testach hi-fi; plan w tym dokumencie, ADR-0038..0040)

## User goal
> „chce zrezygnować z progress bara na liście otwartych wątków. wolę zostawić tylko licznik otwartych wątków. i chcę mieć tam też małą ikonę pucharu z listą zrobionych zadań (zwycięstw). dodatkowo na liście otwartego wątku chcę przemeblować trochę: pole do dodawania akcji powinno być nad listą, wykonane zadania na końcu w zwiniętej sekcji.”

Trzy decyzje z jednej sesji testowej, wszystkie w module workbench (zero zmian w data-layer i pozostałych modułach):
1. **ADR-0038** — karta wątku bez pasa progresu i bez `done/total`; nagłówek listy z samym licznikiem otwartych.
2. **ADR-0039** — zwijana sekcja „Zwycięstwa” (zielony puchar + licznik) na dole lewej kolumny, nad „Domkniętymi”; lista wszystkich zrobionych akcji, najświeższe pierwsze, z tytułem wątku i datą.
3. **ADR-0040** — panel akcji: pole dopisywania kroku przypięte **nad** listą; zrobione akcje w zwiniętej sekcji „Wykonane (N)” na końcu; cel dalej ostatni.

## Decyzje zakresowe
1. **Zwycięstwa = wszystkie zrobione akcje** (wątki otwarte i domknięte), nie tylko dzisiejsze — puchar to gablota, nie bilans dnia (ten zostaje w dzienniku). Sort `doneAt` malejąco.
2. **Sekcja Zwycięstwa read-only** — bez odhaczania i usuwania; jedyna powierzchnia pisząca w akcjach zostaje panel.
3. **„Wykonane” tylko gdy istnieje** — zero sekcji dla pustki; rozwinięcie to świadoma decyzja.
4. **Pole nad listą pinned** (poza scrollem) — przechwycenie zawsze widoczne; lista scrolluje pod nim.
5. **Licznik otwartych w nagłówku bez zmian** — istniał; pasek z kart znika, nic go nie zastępuje w progu.

## Impact map
- **Modules affected**: wyłącznie `workbench` (komponenty + jedna lib pochodnych) i dokumenty.
- **Cross-module integration**: brak — `useAllActions()` już istniał na kolumnie; zwycięstwa liczone z tej samej kwerendy, tytuły wątków z list otwartych/zamkniętych. liveQuery odświeża sekcję automatycznie po każdym odhaczeniu (także z ekranu Teraz).
- **Data**: zero zmian — `doneAt` istniał od początku (`LoopAction`); bez bumpu schematu.

## Per-file changes (residual — direct edits)
- `src/modules/workbench/lib/workbench-ui.ts` — `ProgressView`/`getProgressView` → `CardStatusView`/`getCardStatusView` (rodzaj `'bar'` usunięty; zostaje `actions`/`waiting-only`/`empty`).
- `src/modules/workbench/components/loop-card.tsx` — `ProgressArea` → `CardStatusArea`: etykieta stanu + wskaźniki czeka/po terminie; karta rozpisanego wątku bez pochodnych; bez `role="progressbar"`.
- `src/modules/workbench/components/wins-section.tsx` — nowy: chevron + zielony `Trophy` + badge licznika; rozwinięcie = lista `WinEntry` (label, tytuł wątku, data); pusty stan po rozwinięciu.
- `src/modules/workbench/components/loop-list-column.tsx` — pochodna `wins` (filter done + sort doneAt desc + mapa tytułów) i montaż `<WinsSection>` nad `<ClosedLoopsSection>`.
- `src/modules/workbench/components/done-actions-section.tsx` — nowy: zwijany „Wykonane (N)” w konwencji sekcji zamkniętych; wiersze przez children.
- `src/modules/workbench/components/action-panel.tsx` — kolejność: header → `ActionAddForm` (shrink-0) → lista otwartych → `DoneActionsSection` → `PinnedGoal`; `openActions`/`doneActions` do renderu, `orderedActions` dalej karmi DnD; teksty pustego stanu („pole powyżej”).
- `src/modules/workbench/components/action-add-form.tsx` — tylko komentarz doc.
- `src/modules/workbench/components/loop-card.stories.tsx` — `WithProgress` → `OpenActions` (fixture mieszany zostaje, opis o braku bara).
- Dokumenty: ADR-0038/0039/0040 (nowe), `docs/modules/workbench.md`, `docs/MODULES.md`, `docs/GLOSSARY.md` (pasek/progres przestrojone), `docs/changes/` (ten plik).

## States & Edge cases
- **Wątek rozpisany na „mój ruch”** → karta bez żadnej pochodnej (tytuł + ewentualne czeka/po terminie) — celowe milczenie, ADR-0038.
- **Wszystkie „mój ruch” zrobione, wątek otwarty** → legalne; karta milczy, domknięcie należy do celu (stary edge „100%” znika razem z barem).
- **Zero zrobionych akcji w świecie** → „Zwycięstwa (0)”; rozwinięcie pokazuje „Jeszcze pusto — odhacz pierwszy krok.”.
- **Akcja domkniętego wątku** → jej zwycięstwo dalej na liście (tytuły z listy zamkniętych).
- **Odhaczenie wstecz** → znika ze Zwycięstw natychmiast (liveQuery) i wraca na listę otwartych panelu.
- **Sekcja Wykonane zwinięta** → wiersze poza DOM, DnD planuje tylko widoczne; rozwinięcie przywraca drag w grupie (ADR-0030 nietknięty).
- **Done usuwana z sekcji** → dalej za potwierdzeniem (traci dzisiejsze zwycięstwo dziennika — ACTIONS.md bez zmian).
- **Żaba done** → toggle żaby disabled w sekcji Wykonane (bez zmian, ta sama kontrolka).

## Routing — which proto skill builds what
| Step | Skill | Target | What it does |
|------|-------|--------|--------------|
| 1 | (ten dokument) | — | decyzje + residual |
| 2 | direct edits | workbench + docs | wszystkie zmiany powyżej (warstwa prezentacji, gotowe tokeny) |

Brak nowych ekranów/encji/stanów pełnoekranowych — nie routuje się do proto-lofi/harden; wizualnie komponenty kopiują sprawdzone wzorce (sekcje zwijane, tokeny success/warning).

## Later (deferred)
- Granulacja Zwycięstw po dniach (dziś jedna lista „najświeższe pierwsze”; dziennik pozostaje miejscem bilansu).
- Większe zwycięstwa (domknięte wątki) w sekcji — na dziś puchar liczy tylko małe zwycięstwa.
- Licznik zwycięstw przy nagłówku kolumny (dziś puchar żyje w nagłówku swojej sekcji).
