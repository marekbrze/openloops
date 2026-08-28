# [0032] - Hi-fi design applied to now

**Date**: 2026-08-28
**Module**: now (+ wspólna warstwa tokenów projektu)
**Status**: Accepted

## Context
Moduł now był neutralnym lo-fi (chroma-0 szarości shadcn). `docs/DESIGN.md` (ADR-0031) definiował kierunek: product, Restrained, seed sky ~235, oba motywy, Geist + Geist Mono, motion funkcyjny.

## Decision
Położono warstwę tokenów OKLCH w `src/index.css` (Tailwind v4 `@theme inline` + `:root`/`.dark`): rampa `--brand-50…900` jako prymitywy stałe; neutralne tintowane chłodno ku hue 235–240; dark mode jako głębia jasności powierzchni (canvas 0.16 → card 0.205 → popover 0.25); semantyczne **success/warning z parą main+ink** (ink dla tekstu na tincie, próg 4.5:1); radius 0.5rem; focus ring brand; `--ease-spring`; globalny fallback `prefers-reduced-motion`; `color-scheme: light/dark` dla natywnych kontrolek; import Geist Mono. Zmiana semantyki: **„po terminie" z destructive na warning** (DESIGN.md: amber = wstrzymanie/czekanie; destructive zostaje dla błędów i usuwania). Ekran: nagłówek dnia font-semibold (700 tylko wordmark), zegar w Geist Mono `text-2xl tabular-nums`, wiersze kolejki bez cienia (matte hairline) z subtelnym hover, kontekst `text-xs` zamiast arbitralnego 11px. Interakcje, dane i stany brzegowe nietknięte.

## Impact
Warstwa tokenów jest projektowa — kolejne moduły (workbench, journal, tasks) dziedziczą paletę, motywy i typografię bez zmian w kodzie. Zweryfikowano buildem i screenshotami (light/dark, stan done, modal „Wybierz zadania" — dziedziczy tokeny). proto-polish = finalny pass (kontrast detal, stany, a11y).
