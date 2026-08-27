/**
 * Identyfikatory widoków górnego paska — jedyne źródło prawdy dla nawigacji i eventów.
 * `now` jest widokiem startowym aplikacji (ADR-0020).
 */
export type ViewId = 'now' | 'tasks' | 'workbench' | 'journal'
