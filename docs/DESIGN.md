# Design Direction

## Register
**product** — narzędzie pracy (kolejka, wątki, bilans); design służy zadaniu, ma zniknąć w pracę. Bar: earned familiarity — użytkownik biegły w Linear/Things/Raycast ufa temu interfejsowi bez czytania.

## Scene
UX-owka pracuje z tym cały dzień — rano planuje kolejkę przy jasnym oknie, w ciągu dnia odhacza pozycje między spotkaniami, wieczorem czyta bilans dnia; aplikacja musi działać o każdej porze → **motyw jasny (default) + motyw ciemny**, jedna para warstw tokenów.

## Personality
**matowe i cienkie i sprężyste** (tłumaczenie słów projektanta: „eleganckie, minimalistyczne, szybkie"):
- *matowe* — powierzchnie bez połysku i bez dekoracji; elegancja z dyscypliny, nie z ornamentu.
- *cienkie* — hairline'y zamiast grubszych ramek i cieni; oddech; papierowa lekkość.
- *sprężyste* — natychmiastowa odpowiedź interfejsu; żadna animacja nie wydłuża drogi do celu.

## References
- **Things 3**: elegancja minimalizmu — dużo światła, hojny oddech, świetna typografia list; lista jako główny obiekt ekranu.
- **Linear**: spokój i szybkość — zero zbędnych pikseli, precyzyjne stany hover/active, klawiaturowość.
- **Vercel/Geist**: monochromatyczna dyscyplina — cienkie granice, jeden sans, wszystko lekkie (Geist już jest fontem projektu).
- **Raycast**: sprężystość — snappy transitions, vibe narzędzia dla profesjonalistów.

## Anti-references
- **Konfetti i gamifikacja** (Habitica i podobne): naklejki, konfetti, emoji-sztafety — karykaturują „małe zwycięstwa" i zabijają elegancję. Zwycięstwo jest komunikowane spokojnie: wpis + znacznik, nie fajerwerk.
- **Generyczny AI-dashboard**: wszędzie karty, wszędzie pilli, zaokrąglone 16px, szare bloki, sekcje z mikro-nagłówkami uppercase. To dokładnie ten „wygląda jak AI" lookup, którego unikamy.
- *(przy okazji)* Notion/Jira/Asana: korpo-ciężar, rozwlekłość, wolne interfejsy.

## Color
**Strategy**: **Restrained** — chłodne neutralne barwione ku ziarnu + jeden akcent (sky) ≤10% powierzchni. Akcent pojawia się na: interaktywnych elementach (primary button, aktywna zakładka, focus, przełącznik „Teraz"), progres barze „mój ruch" i CTA „Domknij".
**Seed hue**: **sky, hue ~235–242** (Tailwind sky — świadomy wybór projektanta: „lekki i oddychający"). Nie jest to reflex-blue: chroma trzymamy w ryzach, neutralne są chłodno-sky-tintowane (nie kremowe), a udział akcentu ograniczony do 10%.

### Prymitywy (rampa brand, stała w obu motywach)
| Token | Value | Notes |
|---|---|---|
| --brand-50 | oklch(0.971 0.014 236) | najjaśniejszy tint (tła selected) |
| --brand-100 | oklch(0.951 0.026 236) | tint hover |
| --brand-200 | oklch(0.901 0.058 231) | |
| --brand-300 | oklch(0.828 0.111 230) | |
| --brand-400 | oklch(0.746 0.16 233) | primary w ciemnym |
| --brand-500 | oklch(0.685 0.169 237) | ziarno (Tailwind sky-500) |
| --brand-600 | oklch(0.588 0.158 242) | |
| --brand-700 | oklch(0.5 0.134 242) | **primary w jasnym** (buttons, ring) — biały tekst 5.75:1, text-primary 5.84:1; brand-600 miewał 3.96 na labelach przycisków |
| --brand-800 | oklch(0.443 0.11 241) | |
| --brand-900 | oklch(0.391 0.09 241) | |

### Neutralne (tint ku hue 235, NIE kremowe)
| Role | Token | Light | Dark |
|---|---|---|---|
| canvas (body bg) | --background | oklch(0.964 0.008 235) | oklch(0.145 0.015 240) |
| surface (card) | --card | oklch(1 0 0) | oklch(0.215 0.017 240) |
| raised (popover) | --popover | oklch(1 0 0) | oklch(0.265 0.019 240) |
| muted surface | --muted | oklch(0.948 0.01 235) | oklch(0.265 0.015 240) |
| hover accent bg | --accent | oklch(0.934 0.014 235) | oklch(0.295 0.017 240) |
| ink (body) | --foreground | oklch(0.24 0.015 240) | oklch(0.955 0.006 235) |
| ink secondary | --muted-foreground | oklch(0.5 0.018 240) | oklch(0.72 0.014 235) |
| hairline | --border | oklch(0.918 0.008 235) | oklch(0.985 0 0 / 12%) |
| input border | --input | oklch(0.9 0.01 235) | oklch(0.985 0 0 / 15%) |
| ring (focus) | --ring | --brand-700 | --brand-400 |

Chroma neutralnych: 0.008–0.019, ku **hue 235–240** (chłodno, „oddychająco"). Zero czystej szarości (chroma 0 = martwe), zero default-warm kremów (~hue 60).

### Semantyczne (2–3 odcienie każdy; **info = brand sky**, brak czwartego huesu)
| Rola | Light | Dark | Użycie w openloops |
|---|---|---|---|
| success | oklch(0.63 0.15 150) / tint oklch(0.955 0.03 150) / tekst na tincie oklch(0.42 0.11 150) | oklch(0.72 0.14 150) | **wyłącznie zwycięstwa**: wpisy dziennika, „domknięty wątek", success-toast. Sky = interakcja, zielony = zwycięstwo — nie mieszamy. |
| destructive | oklch(0.577 0.2 27) / tint oklch(0.955 0.02 27) | oklch(0.68 0.17 25) | błędy, porzucenie wątku, usuwanie |
| warning | oklch(0.68 0.14 75) / tint oklch(0.96 0.035 80) | oklch(0.78 0.13 75) | „czekam na kogoś" po terminie (data dopytania), stany wstrzymania |

**Dark mode**: głębia z jasności powierzchni (canvas 14.5% → card 21.5% → popover 26.5%), ten sam hue/chroma co brand; akcent jaśnieje do --brand-400; **kroki surfaces dobrane pod zauważalność** (canvas↔card ΔL≥0.035, hover na karcie = pełna tinta muted, nie rozcieńczona). **Pola inline**: stojące na kanwie = `bg-card` (jaśniejsze od otoczenia — pole aktywne, nie wyłączone; dashed border = slot na wpisanie); „studzienka" `bg-muted` tylko zagnieżdżona w białej karcie. Tylko warstwa semantyczna (`:root` ↔ `.dark`) się zmienia — prymitywy stałe. **Scrim modala**: stały `oklch(0 0 0 / 45%)` w obu motywach (jasna mgła z `foreground/50` w dark była błędem).
**Radius**: jedyna wartość **--radius: 0.5rem** (8px — ciszej i precyzyjniej niż obecne 10px); warianty jak w Tailwind v4 `@theme` (sm ×0.6, md ×0.8, lg ×1, xl ×1.4…). **Focus ring**: brand sky, 2px, offset 2px.

## Typography
**Direction**: jeden dobrze nastrojony sans — **Geist Variable** (już w projekcie; dosłownie font referencji Vercel/Geist) + **Geist Mono** wyłącznie na zegar i liczby.
**Scale**: stały rem, kroki (Tailwind xs–2xl): 0.75 / 0.875 (baza UI) / 1 / 1.125 / 1.25 / 1.5 rem + **jeden krok display 2.25rem, zarezerwowany wyłącznie dla liczb bilansu tygodnia** (najcięższy element ekranu dziennika). Stosunek kroków ≤1.2 na sąsiednich krokach używanych. *(Implementacja: domyślne kroki Tailwind zamiast listy 13px/21px — mniej wartości arbitralnych, ten sam rytm.)*
**Weights**: 400 (body) / 500 (UI emphasis, buttons, tabs) / 600 (headings) / 700 (tylko wordmark „openloops"). Cztery, nie więcej.
**Loading**: fontsource (self-hosted, bundlowane), `font-display: swap`; dokładać tylko `@fontsource-variable/geist-mono`.
**Details**: Geist Mono + `tabular-nums` na żywym zegarze Teraz, licznikach bilansu i datach; tracking −0.01em na nagłówkach; line-height 1.5 body / 1.2 headings; measure 65ch dla dłuższych tekstów dziennika. Bez fontów display w labelach i danych.

## Motion
**Tylko funkcyjny**: 150–250ms, wyłącznie stany — hover 150ms, open/close popoverów i modalów 200ms, feedback drag & drop 150ms, toast in/out 200ms. Easing `cubic-bezier(0.16, 1, 0.3, 1)` (sprężyste wyhamowanie). Zero choreografii wejścia na ekran, zero animowanych atrakcji. `prefers-reduced-motion`: przejścia do opacity-only. Signature moments: brak (świadomie — zwycięstwo celebruje treść i semantyczny zielony, nie animacja).

## Guardrails
**Absolute bans**: side-stripe borders (`border-left/right > 1px` jako kolorowy akcent — zamiast tego pełne hairline'y, tinta tła lub glyph wiodący) · gradient text (`background-clip: text`) · glassmorphism jako default · hero-metric template i identyczne siatki kart · tiny uppercase tracked eyebrows nad sekcjami · znaczniki `01/02/03` jako default'owy szkielet · tekst przelewający kontener w każdym breakpoincie.
**Product bans**: dekoracyjny motion, który nie jest stanem · niespójne słownictwo komponentów między ekranami · fonty display w labelach/buttonach/danych · reinwencja standardowych affordancji (custom scrollbary, dziwne formularze) · ciężkie akcenty na stanach nieaktywnych · modal jako pierwszy pomysł (najpierw inline/toast/popover) · **konfetti i gamifikacja** (anty-referencja) · **generyczny AI-dashboard** (karty-naklejki wszędzie, pilli wszędzie, zaokrąglenia 16px).
**Contrast floor**: body ≥4.5:1 · duży tekst/komponenty UI ≥3:1 · placeholder ≥4.5:1 (nie szary default) · `--muted-foreground` jasny 0.5 / ciemny 0.72 — dobrane z zapasem nad progiem.

## Hand-off to proto-design
Warstwa tokenów: **Tailwind v4 — `@theme inline` + `:root`/`.dark`** (obecne). Najwyższa dźwignia na start: **wymiana neutralnego baseline'u** (chroma-0 szarości → chłodne sky-tintowane neutralne + akcent --brand-600) w `src/index.css` — cały interfejs odziedziczy charakter bez ruszania komponentów. Potem: import Geist Mono + zegar/liczby na mono; radius 0.5rem; weryfikacja progów kontrastu na stanie-wyjściowym.
Kolejność modułów (wg MODULES.md i ruchu): **now** (ekran startowy, najczęstszy) → **workbench** (najbardziej złożony) → **journal** (najbardziej emocjonalny — bilans, zielone zwycięstwa) → **tasks** (modal, dziedziczy wzorce now). Wspólne (AppShell, toasty) dostają tokeny przy **now**.
