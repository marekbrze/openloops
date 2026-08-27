# [0005] - Stały layout dwukolumnowy z placeholderem selekcji

**Date**: 2026-08-27
**Module**: workbench
**Status**: Accepted

## Context
Co widać w prawej kolumnie, gdy nic nie jest zaznaczone? Alternatywa (panel ukryty, lista pełna szerokość) skakałaby layoutem przy każdym zaznaczeniu.

## Decision
Układ dwukolumnowy stały. Prawa kolumna bez zaznaczenia pokazuje placeholder-zachętę („Wybierz wątek…”); przy całkiem pustej liście wersja pierwszego uruchomienia („nazwij pierwszy wątek…”).

## Impact
docs/modules/workbench.md (Screens). Zero przesunięć layoutu podczas pracy; jeden stan less-mobile-breakpoint do rozstrzygnięcia w lo-fi.
