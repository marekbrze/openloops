# Bug: Drag zadań wychodzi w prawo — kolejka powinna ciągnąć się tylko góra-dół

## Type
Bug (diagnosed by proto-bug)

## Severity
🟡 medium — główny ekran pracy, każdy drag wygląda „zepsuty” (wiersz ucieka w bok i unosi się nad layoutem); nie gubi danych, ale podgryza zaufanie do podstawowej interakcji.

## User goal
> „mam problem z widokiem today. przeciaganie zadan aktywuje jakis container i moge przesuwac zadania w ogole w prawo. tak nie powinno byc. powinienem moc tylko przesuwac je gora dol”

## Reproduction
1. Teraz (widok today), ≥ 2 zadania w kolejce.
2. Złap uchwyt (GripVertical) i przeciągnij w prawo.
3. Wiersz podąża za kursorem w poziomie — jako podniesiona karta (`zIndex: 20`, `opacity-80`) nachodzi na resztę layoutu; to jest „aktywujący się kontener” z raportu.
**Expected**: wiersz porusza się wyłącznie w osi pionowej (reorder kolejki).
**Actual**: pełna translacja dwuosiowa — X swobodnie, Y tylko przy rozsypywaniu pozostałych wierszy.
**Reliability**: za każdym razem, niezależnie od danych.
**Location**: `src/modules/now/components/now-screen.tsx:119` (moduł now / ekran Teraz, akcja Reorder Queue) — ten sam wzorzec w `loop-list-column.tsx:102` i `action-panel.tsx:129`.

## Root cause
**Class**: logic error (błędna konfiguracja DnD — brak modyfikatora osi; kod robi dokładnie to, co dnd-kit robi domyślnie).

**Cause**: W sortable dnd-kit przeciągany element **nie dostaje** transformu ze strategii. Gdy nie ma DragOverlay (nasz przypadek), aktywny wiersz dostaje `dragSourceDisplacement` — surowy `transform` z `useDraggable`, czyli pełną deltę kursora `{x, y}` (`node_modules/@dnd-kit/sortable/dist/sortable.esm.js:508-517`: `shouldDisplaceDragSource = !useDragOverlay && isDragging`). Strategia `verticalListSortingStrategy` rozsuwa w pionie **tylko pozostałe** wiersze — pozycją podniesionego elementu nigdy nie steruje. Ograniczenie ruchu do osi to w dnd-kit rola `modifiers` na `DndContext` — a żadnego nie podajemy i pakiet `@dnd-kit/modifiers` w ogóle nie jest zależnością projektu (`package.json` dependencies; `grep modifiers/restrictTo src/` → 0 wyników).

**Evidence**:
- `src/modules/now/components/now-screen.tsx:119` — `<DndContext sensors={sensors} collisionDetection={closestCenter} …>` bez propa `modifiers`.
- `src/modules/now/components/now-screen.tsx:159` — `transform` wprost na `style` wiersza + `zIndex: 20`; `:165` — `isDragging && 'opacity-80'` → podniesiona karta realnie odlatuje w bok.
- `src/modules/workbench/components/loop-list-column.tsx:102`, `src/modules/workbench/components/action-panel.tsx:129` — identyczny wzorzec (te same 3 propy, zero modifiers).
- Spec (intent): `docs/modules/now.md:42` („kolejka… uchwyt DnD”), `:53` („Reorder Queue | Drag & drop pozycji kolejki”) — reorder **pionowej kolejki**; ruch poziomy nie ma żadnej semantyki w specyfikacji.

## Fix plan
**Change**: dodać zależność `@dnd-kit/modifiers` i na wszystkich trzech pionowych DndContextach `modifiers={[restrictToVerticalAxis]}` (Teraz: kolejka; workbench: lista wątków i panel akcji). Modyfikator clampuje X translacji (i tego, co widzi collision detection), zostawiając reorder i `handleDragEnd` bez zmian.
**Spec impact**: kosmetyczne doprecyzowanie — w wierszach DnD speców dopisać „tylko oś pionowa” (now.md:53, workbench.md — Reorder wątków/akcji).

## Regression scope
- **Keyboard sensor** — `sortableKeyboardCoordinates` (now-screen.tsx:96 i odpowiedniki) jest z natury pionowy; modyfikator niczego nie zmienia w dostępności klawiaturą.
- **`handleDragEnd`** — liczy z indeksów `rows`, nie ze współrzędnych; bez zmian.
- **Collision detection** — `closestCenter` uwzględnia modyfikatory; przy ograniczeniu do osi Y zachowuje się jak dotychczas przy dragu pionowym (dotychczasowy ruch pionowy pozostaje referencją).
- **Trzy DndContexty naraz** — zweryfikować drag w Teraz i w obu listach workbench (wątki, akcje).
- Related edge cases: brak klastra — wszystkie listy DnD w aplikacji są pionowe i współdzielą jedną konfigurację.

## Routing
| Step | Skill / action | Target | What |
|------|----------------|--------|------|
| 1 | (direct edit) | `now-screen.tsx:119`, `loop-list-column.tsx:102`, `action-panel.tsx:129` + `npm i @dnd-kit/modifiers` | now: DndContext bez modifiers; change to: `modifiers={[restrictToVerticalAxis]}`; why: root cause wyżej |
| 2 | (weryfikacja) | `vite preview` + Playwright headless | drag uchwytu w prawo → oczekiwany X=0; drag w dół → zamiana kolejności zapisana |
| 3 | (docs) | specy modułów + ADR-0042 | doprecyzowanie „tylko oś pionowa” |

## Hand-off
Direct edit z kroku 1 jest precyzyjny i mały (1 zależność + 3 propy) — zastosować natychmiast, potem krok 2 jako potwierdzenie behawioralne.
