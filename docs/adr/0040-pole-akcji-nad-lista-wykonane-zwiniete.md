# [0040] - Pole akcji nad listą, „Wykonane” w zwiniętej sekcji

**Date**: 2026-09-10
**Module**: workbench
**Status**: Accepted (extends ADR-0030)

## Context
Panel akcji miał pole dopisywania kroków **pod** listą (nad celem). User po testach: pole ma być nad listą, a zrobione zadania — na końcu, w zwiniętej sekcji. Auto-sort z ADR-0030 (done zawsze na dole) już przygotował ten ruch: dolna grupa staje się sekcją.

## Decision
Panel akcji od góry: **nagłówek → pole dopisywania kroku (pinned, ADR-0040) → lista akcji otwartych → zwijana sekcja „Wykonane (N)” → przypięty cel (nadal ostatni)**. Pole jest poza obszarem przewijania — przechwycenie zawsze pod ręką, niezależnie od długości listy. Sekcja „Wykonane” w konwencji „Domkniętych i porzuconych” (chevron + licznik w badge), **zwinięta domyślnie**, renderowana tylko gdy coś jest zrobione. Wiersze wewnątrz to te same `SortableActionRow`: odhaczenie wraca na listę otwartych, usunięcie done nadal za potwierdzeniem, drag & drop wewnątrz grupy dalej działa (ADR-0030 bez zmian — auto-sort widokowy, ręczna kolejność pamiętana). Zwinięta sekcja wyłącza wiersze z dragowania — planują się tylko widoczne.

## Impact
`action-panel.tsx` (kolejność renderu, `openActions`/`doneActions` zamiast pojedynczej `orderedActions` w renderze; `orderedActions` zostaje dla `SortableContext` i `handleDragEnd`), `done-actions-section.tsx` (nowy), `action-add-form.tsx` (komentarz), teksty stanu pustego („pole powyżej”). Spec: `workbench.md`.
