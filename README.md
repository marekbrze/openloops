# openloops

Local-first system do prowadzenia otwartych wątków roboczych: każdy wątek ma rozpisane akcje (mój ruch / czekam na kogoś) zakończone celem-definition-of-done, a dziennik loguje dzień po dniu skończone akcje i domknięte wątki — pętla małych zwycięstw.

Dokumentacja produktu: [`docs/`](docs/PROJECT.md) — od pomysłu (init), przez model domeny (deepen), po moduły (strategize).

## Stack

React + Vite + TypeScript · Tailwind v4 · shadcn/ui (base-nova) · Storybook (+ a11y addon) · Dexie (IndexedDB) · ESLint z `jsx-a11y` na poziomie WCAG **AA**

## Development

```bash
npm install        # jednorazowo
npm run dev        # dev server
npm run build      # tsc + vite build
npm run lint       # eslint + jsx-a11y
npm run storybook  # komponenty w izolacji + a11y panel
```

## Moduły

- **workbench** — ekran główny: lista wątków (priorytet ręczny, progres) + panel akcji z przypiętym celem
- **journal** — dziennik zwycięstw z nawigacją po tygodniach
- **data-layer** — schemat Dexie, repozytoria, semantyka wpisów zwycięstw

Narzędzia deweloperskie: pasek scenariuszy danych (`empty` / `minimal` / `full`) widoczny tylko w trybie dev.
