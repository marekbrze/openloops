# [0031] - Visual direction captured

**Date**: 2026-08-28
**Module**: wszystkie (warstwa wizualna)
**Status**: Accepted

## Context
Prototyp był neutralnym lo-fi (shadcn defaults: chroma-0 szarości, Geist, radius 0.625rem) po pełnym łańcuchu detail → lofi → edgecases → harden na wszystkich 4 modułach. Przed warstwą hi-fi potrzebny był spisany kierunek wizualny, żeby proto-design nie rozstrzygał kierunkowych decyzji per ekran.

## Decision
Spisano register, scenę, osobowość, referencje, strategię koloru + paletę OKLCH, typografię i motion w `docs/DESIGN.md`. Register: **product** (oba motywy: jasny default + ciemny). Osobowość: **matowe i cienkie i sprężyste**. Strategia koloru: **Restrained**, seed hue: **sky ~235–242** (Tailwind sky — świadomy wybór projektanta), neutralne chłodno-tintowane ku 235–240. Semantyczny **zielony zarezerwowany wyłącznie dla zwycięstw** (dziennik, domknięcia, success-toast) — sky = interakcja, zielony = zwycięstwo. Typografia: **Geist Variable + Geist Mono** (mono tylko zegar/liczby, tabular-nums). Motion: **tylko funkcyjny** 150–250ms + reduced-motion fallback. Radius: 0.5rem. Anty-referencje wiążące: konfetti/gamifikacja, generyczny AI-dashboard.

## Impact
proto-design wdraża to per moduł w kolejności now → workbench → journal → tasks, zaczynając od wymiany baseline'u tokenów w `src/index.css`. proto-polish to finalny pass. Zmiana kierunku = edycja `docs/DESIGN.md` lub ponowne proto-brand.
