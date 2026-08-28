# [0034] - Hi-fi design applied to journal

**Date**: 2026-08-28
**Module**: journal
**Status**: Accepted

## Context
Dziennik był neutralnym lo-fi na położonej warstwie tokenów (ADR-0032). DESIGN.md (ADR-0031) definiował kierunek; bilans tygodnia nosił wzorzec identycznych kafli i uppercase-eyebrow, a zwycięstwa nie używały zarezerwowanego im zieleni.

## Decision
**Bilans tygodnia**: dwa identyczne kafle → jeden blok z pionowym hairline (ban identycznych siatek); etykiety zwykłym case'em (ban uppercase-eyebrow); liczby zostają na kroku display 2.25rem — jedyny taki krok w systemie, udokumentowany w DESIGN.md. **Semantyka zwycięstw**: ikony CheckCircle2/Trophy (bilans, nagłówki dni, wiersze wpisów) → success green, ale **tylko przy wartości > 0** — puste stany liczone uczciwie, niczego nie celebrują („bilans zawsze realny", ADR-0017). Pill „dziś" → sky tint (`bg-primary/10`), spójny z językiem zaznaczenia/bieżącego stanu. Kontrast: „Brak zwycięstw" z `text-muted-foreground/70` na pełny muted (próg 4.5:1). Interakcje i stany nietknięte — screenshoty light/dark.

## Impact
Dziennik hi-fi; jedyny moduł używający zieleni w liczbach — koresponduje z Trofeum w modalu domknięcia (ADR-0033) i success-toastami. proto-polish = finalny pass.
