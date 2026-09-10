# Change: Licznik zwycięstw per wątek + żaby zawsze na szczycie listy

## Type
Feature + UX refactor (kontynuacja testów hi-fi; ADR-0041)

## User goal
> „licznik zwycięstw powinien być per wątek na workbench, tak żebym widział co to za wątek, ile było zwycięstw i ile otwartych zadań zostało. ważne jest też to, że frogs zawsze powinny być na początku listy. jak dodaję nowy wątek to on powinien dodać się poniżej frogs.”

Trzy decyzje z jednej sesji, wszystkie w workbench (data-layer tylko komentarze):
1. **Licznik per wątek** — karta pokazuje 🏆 zwycięstwa (zrobione akcje) · otwarte zadania; zielona tinta pucharu tylko przy > 0.
2. **Żaby zawsze na początku** — widokowa pinacja nad ręcznym sortOrder (amend ADR-0037 dla listy wątków; drag & drop rządzi wewnątrz grup).
3. **Nowy wątek poniżej żab** — automatycznie: `loopsRepo.add` (min sortOrder) + pinacja widoku = szczyt grupy nie-żab.

## Decyzje zakresowe
1. **Zwycięstwa per wątek = zrobione akcje obu typów** — spójne z dziennikiem (każde done = małe zwycięstwo); nie tylko MyMove.
2. **Uczciwe zero** — „🏆 0” bez zieleni i „0 otwartych zadań” są pokazywane wprost (ADR-0017); brak akcji to dalej „rozpisz kroki…”.
3. **Etykieta „cały czeka na innych · N” znika** — licznik + wskaźnik „czeka” przenoszą tę informację; `CardStatusView` redukuje się do `counts`/`empty`.
4. **Pinacja widokowa, nie bazowa** — `sortOrder` zostaje ręcznym priorytetem; żaby sortowane przed nie-żabami stabilnym sortem w `useOpenLoops`. Przeciągnięcie żaby niżej jest możliwe i wraca przy renderze (wzór ADR-0030); `loopsRepo.setFrog` zachowuje skok min-1 dla surowej kolejności w katalogu Zadania.
5. **Nowy wątek: zero zmian w repo** — min sortOrder + pinacja = poniżej żab.

## Per-file changes (residual — direct edits)
- `src/modules/workbench/hooks/use-workbench.ts` — `useOpenLoops`: stabilny sort żab przed resztą.
- `src/modules/workbench/lib/workbench-ui.ts` — `CardStatusView` = `counts(wins, open)` | `empty`; `getCardStatusView` liczy done/undone.
- `src/modules/workbench/components/loop-card.tsx` — `CardStatusArea`: Trophy + wins · openTasksLabel(open), wskaźniki czeka/po terminie; helper PL mnogiej.
- `src/modules/workbench/components/loop-card.stories.tsx` — komentarz + nowy story `AllDone` (zwycięstwa przy zerze otwartych).
- `src/modules/data-layer/repositories/index.ts`, `types/index.ts` — tylko komentarze (semantyka ADR-0041).
- Dokumenty: ADR-0041, ten plik, `workbench.md`, `MODULES.md`, `GLOSSARY.md`, `ACTIONS.md`, `ENTITY_MAP.md`.

## States & Edge cases
- **0 akcji** → „rozpisz kroki…” (bez licznika).
- **0 zwycięstw, ≥ 1 otwarte** → puchar szary, liczba mówiona wprost.
- **Wszystko zrobione, wątek otwarty** → „🏆 N · 0 otwartych zadań” + ewentualne czeka/po terminie; domknięcie dalej decyzją celu.
- **Same WaitingOn** → licznik + „czeka”; dedykowana etykieta nie wraca.
- **Żaba przeciągnięta w dół** → zapis wykonuje się, widok pinuje żabę z powrotem na szczyt; drag wewnątrz grup działa.
- **Nowy wątek przy żabach na liście** → ląduje pod grupą żab, nad resztą nie-żab.
- **Oznaczenie żaby** → natychmiast na szczycie (widok); zdjęcie żaby wraca na swoje miejsce wg sortOrder.

## Routing — which proto skill builds what
| Step | Skill | Target | What it does |
|------|-------|--------|--------------|
| 1 | (ten dokument) | — | decyzje + residual |
| 2 | direct edits | workbench + docs | wszystkie zmiany (gotowe tokeny, wzorce z ADR-0030/0038/0039) |

Brak nowych ekranów/encji — nie routuje się do proto-lofi/harden.

## Later (deferred)
- Pinacja grup żab w katalogu Zadania (dziś dziedziczy surowy sortOrder; skok z `setFrog` zwykle wystarcza).
- Licznik per wątek na karcie w modalu Zadania (dziś tylko glify).
- Drag-opór dla żab (wizualny sygnał strefy żab) — dziś powrót przy renderze wystarcza.
