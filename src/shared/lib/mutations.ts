import { notify } from './notify'

const FAILED_MESSAGE =
  'Nie udało się zapisać zmiany — przeglądarka odmówiła dostępu do pamięci albo jest pełna.'

/**
 * Wspólny wrapper mutacji UI (luka #3 audytu): żaden odrzucony Promise nie znika po cichu.
 * Zwraca `true/false`, by formularze wiedziały, czy czyścić pola; reszta call-site'ów ignoruje wynik.
 */
export async function guard(thunk: () => Promise<unknown>): Promise<boolean> {
  try {
    await thunk()
    return true
  } catch (error) {
    console.error('[openloops] zapis nie powiódł się', error)
    notify.error(FAILED_MESSAGE)
    return false
  }
}
