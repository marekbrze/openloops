import type { DayEntry, Loop, LoopAction, Tag } from '@/modules/data-layer'
import type { ScenarioData } from './types'

/* Pomocnice dat — fixture'y liczą się względem „dziś”, żeby overdue/dziennik zawsze żyły. */
const DAY_MS = 86_400_000
const iso = (offsetDays = 0) => new Date(Date.now() + offsetDays * DAY_MS).toISOString()
const dkey = (offsetDays = 0) => {
  const d = new Date(Date.now() + offsetDays * DAY_MS)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
/** Godzina wpisu dziennika o konkretnym czasie — dzień demo wygląda jak przepracowany, nie jak „teraz”. */
const winAt = (offsetDays: number, hour: number, minute: number) => {
  const d = new Date(Date.now() + offsetDays * DAY_MS)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

const tags: Tag[] = [
  { id: 'tag-ux', name: 'UX', createdAt: iso(-30), updatedAt: iso(-30) },
  { id: 'tag-marketing', name: 'marketing', createdAt: iso(-25), updatedAt: iso(-25) },
  { id: 'tag-dev', name: 'dev', createdAt: iso(-20), updatedAt: iso(-20) },
  { id: 'tag-kooperacja', name: 'kooperacja', createdAt: iso(-18), updatedAt: iso(-18) },
]

const loops: Loop[] = [
  {
    id: 'loop-onboarding',
    title: 'Redesign onboardingu w aplikacji',
    status: 'open',
    sortOrder: -5,
    goalText: 'Nowy flow przechodzi test z 5 osobami bez blokera na kroku weryfikacji.',
    tagIds: ['tag-ux', 'tag-kooperacja'],
    createdAt: iso(-6),
    updatedAt: iso(0),
  },
  {
    id: 'loop-brief-q4',
    title: 'Brief kampanii Q4',
    status: 'open',
    sortOrder: -4,
    goalText: 'Brief zatwierdzony przez markę i salesa — jedna wersja dokumentu, zero ścian komentarzy.',
    tagIds: ['tag-marketing'],
    createdAt: iso(-4),
    updatedAt: iso(0),
  },
  {
    id: 'loop-contract',
    title: 'Umowa z podwykonawcą graficznym',
    status: 'open',
    sortOrder: -3,
    goalText: 'Podpisana umowa z zakresem i stawką za ilustrację.',
    tagIds: ['tag-kooperacja'],
    createdAt: iso(-9),
    updatedAt: iso(0),
  },
  {
    id: 'loop-portfolio',
    title: 'Case study openloops w portfolio',
    status: 'open',
    sortOrder: -2,
    goalText: 'Opublikowane case study z procesu i wnioskami.',
    tagIds: ['tag-ux'],
    createdAt: iso(-2),
    updatedAt: iso(-2),
  },
  {
    id: 'loop-retro',
    title: 'Retrospektywa po wdrożeniu design systemu',
    status: 'open',
    sortOrder: -1,
    goalText: 'Retro spisane z trzema ustaleniami na kwartał.',
    tagIds: ['tag-dev'],
    createdAt: iso(-12),
    updatedAt: iso(-1),
  },
  {
    id: 'loop-abonamenty',
    title: 'Porządek w abonamentach narzędziowych',
    status: 'open',
    sortOrder: 0,
    goalText: 'Lista subskrypcji skrócona do używanych; roczna oszczędność policzona.',
    tagIds: [],
    createdAt: iso(-15),
    updatedAt: iso(-3),
  },
  /* Sekcja „Domknięte i porzucone” */
  {
    id: 'loop-audit-ds',
    title: 'Audyt komponentów pod design system',
    status: 'closed',
    sortOrder: 1,
    goalText: 'Audyt spisany: lista komponentów do migracji zaakceptowana przez devów.',
    tagIds: ['tag-dev'],
    createdAt: iso(-40),
    closedAt: iso(-3),
    updatedAt: iso(-3),
  },
  {
    id: 'loop-wiosna',
    title: 'Kampania wiosenna — rozliczenie',
    status: 'abandoned',
    sortOrder: 2,
    goalText: 'Rozliczenie przekazane do marketingu.',
    tagIds: ['tag-marketing'],
    createdAt: iso(-60),
    abandonedAt: iso(-10),
    updatedAt: iso(-10),
  },
]

const mkAction = (
  loopId: string,
  slug: string,
  label: string,
  ownerType: LoopAction['ownerType'],
  extra: Partial<LoopAction> = {},
): LoopAction => ({
  id: `act-${loopId}-${slug}`,
  loopId,
  label,
  ownerType,
  done: false,
  sortOrder: Number(slug.split('-')[0]) - 1,
  createdAt: iso(-5),
  updatedAt: iso(-1),
  ...extra,
})

const actions: LoopAction[] = [
  // Redesign onboardingu — progres 1/2 mój ruch + czekam
  mkAction('loop-onboarding', '0-insighty', 'Zebrać insighty z 5 wywiadów onboardingowych', 'MyMove', {
    done: true,
    doneAt: iso(0),
  }),
  mkAction('loop-onboarding', '1-makieta', 'Zaprojektować makietę ekranu weryfikacji', 'MyMove'),
  mkAction('loop-onboarding', '2-przegląd', 'Przejść makietę z Anią z zespołu deweloperskiego', 'WaitingOn', {
    followUpDate: dkey(3),
  }),
  mkAction('loop-onboarding', '3-poprawki', 'Wdrożyć poprawki po przeglądzie', 'MyMove'),

  // Brief Q4 — plakietka „po terminie” na karcie (data wczorajsza)
  mkAction('loop-brief-q4', '0-kpi', 'Uzupełnić sekcję KPI liczbami z analytics', 'MyMove'),
  mkAction('loop-brief-q4', '1-budget', 'Potwierdzić budżet u finansów', 'WaitingOn', {
    followUpDate: dkey(-1),
  }),
  mkAction('loop-brief-q4', '2-skleic', 'Skleić wersję 0.9 i wysłać do komentarzy', 'MyMove'),

  // Umowa — tylko czekanie (etykieta „cały czeka na innych”)
  mkAction('loop-contract', '0-prawne', 'Zebrać uwagi prawne do szkicu umowy', 'MyMove'),
  mkAction('loop-contract', '1-stawka', 'Czekać na kontrpropozycję stawki godzinowej', 'WaitingOn'),

  // Retro — done z WZOREM (wpis dziennika wczoraj)
  mkAction('loop-retro', '0-oceny', 'Zebrać oceny od zespołu', 'MyMove', {
    done: true,
    doneAt: iso(-1),
  }),
  mkAction('loop-retro', '1-szablon', 'Przygotować szablon retro', 'MyMove'),
  mkAction('loop-retro', '2-sesja', 'Umówić sesję retro z zespołem', 'WaitingOn', {
    followUpDate: dkey(7),
  }),

  // Abonamenty — jeden mój ruch do zrobienia
  mkAction('loop-abonamenty', '0-roczne', 'Przeliczyć koszt roczny poszczególnych planów', 'MyMove'),
]

const dayEntries: DayEntry[] = [
  {
    id: 'act-loop-onboarding-0-insighty:' + dkey(0),
    kind: 'action-done',
    loopId: 'loop-onboarding',
    actionId: 'act-loop-onboarding-0-insighty',
    snapshotText: 'Zebrać insighty z 5 wywiadów onboardingowych',
    dayKey: dkey(0),
    createdAt: winAt(0, 9, 40),
    updatedAt: winAt(0, 9, 40),
  },
  {
    id: 'act-loop-retro-0-oceny:' + dkey(-1),
    kind: 'action-done',
    loopId: 'loop-retro',
    actionId: 'act-loop-retro-0-oceny',
    snapshotText: 'Zebrać oceny od zespołu',
    dayKey: dkey(-1),
    createdAt: winAt(-1, 16, 20),
    updatedAt: winAt(-1, 16, 20),
  },
  {
    id: 'close:loop-audit-ds:' + dkey(-3),
    kind: 'loop-closed',
    loopId: 'loop-audit-ds',
    snapshotText: 'Audyt komponentów pod design system',
    dayKey: dkey(-3),
    createdAt: winAt(-3, 11, 5),
    updatedAt: winAt(-3, 11, 5),
  },
]

/** Pełny świat demo: 6 otwartych wątków o różnych kształtach + sekcja domkniętych. */
export function fullScenario(): ScenarioData {
  return { loops, actions, tags, dayEntries }
}
