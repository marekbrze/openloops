# [0003] - Nowy wątek trafia na górę listy

**Date**: 2026-08-27
**Module**: workbench
**Status**: Accepted

## Context
Pytanie o pozycję nowo dodanego wątku. Repo (proto-devsetup) aktualnie robi `sortOrder = max+1` — dół listy, bywa poza ekranem.

## Decision
Nowy wątek ląduje **na górze** listy (`sortOrder = min−1` semantycznie) i zostaje auto-zaznaczony, żeby od razu rozpisać akcje. Ręczny priorytet usera dalej decyduje po Drag & Drop.

## Impact
ACTIONS.md (Add Loop), ENTITY_MAP.md (komentarz `sort_order`). Implementacja: zmiana `loopsRepo.add`. Reopen nadal wraca na koniec listy (świadome rozróżnienie: przechwycenie ≠ przywrócenie).
