/**
 * Identyfikatory widoków górnego paska — jedyne źródło prawdy dla nawigacji i eventów.
 * `now` jest widokiem startowym aplikacji (ADR-0020); Zadania nie są widokiem —
 * modal „Wybierz zadania" na ekranie Teraz (ADR-0024).
 */
export type ViewId = 'now' | 'workbench' | 'journal'
