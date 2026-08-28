# [0036] - Polish pass on all modules

**Date**: 2026-08-28
**Module**: wszystkie (cała aplikacja)
**Status**: Accepted

## Context
Wszystkie 4 moduły były hi-fi (ADR-0032..0035) i funkcjonalnie kompletne. Finałowy pass przed shippem; quality bar: flagship, bez deadline'u.

## Decision
**Kontrast liczony, nie oceniany** (skrypt OKLCH→sRGB→WCAG): light `--primary` z brand-600 na **brand-700** (biały tekst na przycisku 3.96→5.75, text-primary 4.02→5.84; ciemny bez zmian, 8.86). Wszystkie pary w użyciu ≥4.5:1 dla tekstu / ≥3:1 dla UI (muted 5.6–7.8, warning-ink na tincie 6.2–7.8, success-ink 5.7–7.2, destructive 4.79).
**Drift rozwiązany z przyczyn źródłowych**: (one-off) cztery inline `bg-primary` przyciski retry/boot → wspólny `Button`; (missing token) scrim modala jako stały `--color-scrim: oklch(0 0 0 / 45%)` — dotąd `foreground/50` dawał **jasną zasłonę w ciemnym motywie**; usunięty bezcelowy `backdrop-blur-[1px]`; (vocabulary) hover `bg-secondary` → `bg-muted` — jedna nazwa stanu; (a11y) brakujące h1 w workbench (sr-only, hierarchia h1→h2), focus-visible ring zweryfikowany z klawiatury.
**Jakość kodu**: zero console.log/TODO, build + lint czyste. Copy spójny (Sentence case, polskie cudzysłowy, wielokropki przy zachętach, konsekwentne czasowniki Wybierz/Otwórz/Domknij/Zdejmij). Responsywność strukturalna: < lg workbench zwija się do 1 kolumny, zero poziomego scrolla przy 640px.

## Impact
Aplikacja gotowa do shippa na warstwie wizualnej — robi wszystko co przed pass'em, tylko precyzyjniej. Świeży baseline dla przyszłych zmian: proto-audit.
